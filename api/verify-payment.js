import crypto from 'crypto'
import Razorpay from 'razorpay'

// GST-inclusive price floor per plan/cycle (paise) — mirrors priceBreakdown()
const GST = 0.18
const BASE = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}
function expectedPaise(plan, cycle) {
  const base = (BASE[plan]?.[cycle] ?? 0) * 100
  return base + Math.round(base * GST)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── 0. Authenticate caller via Supabase JWT ──────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' })
  }
  const authHeader = req.headers['authorization'] || ''
  const { createClient: _create } = await import('@supabase/supabase-js')
  const callerClient = _create(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user: caller } } = await callerClient.auth.getUser()
  if (!caller) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    razorpay_subscription_id,
    plan,
    billingCycle,
  } = req.body || {}

  // Use the verified caller's id — never trust userId from the body
  const userId = caller.id

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' })
  }
  if (!razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing required fields' })
  }

  // ── 1. Verify the signature ──────────────────────────────────────────────
  // Subscription:  HMAC(payment_id | subscription_id)
  // One-time order: HMAC(order_id | payment_id)
  const isSubscription = !!razorpay_subscription_id
  let body
  if (isSubscription) body = `${razorpay_payment_id}|${razorpay_subscription_id}`
  else if (razorpay_order_id) body = `${razorpay_order_id}|${razorpay_payment_id}`
  else return res.status(400).json({ success: false, error: 'Missing order or subscription id' })

  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature' })
  }

  // ── 2. Validate plan + user ──────────────────────────────────────────────
  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
  if (!BASE[plan] || !userId) {
    return res.status(400).json({ success: false, error: 'Missing plan or user' })
  }

  const keyId = process.env.RAZORPAY_KEY_ID

  // ── 3. Verify the amount actually paid (blocks ₹1-for-Team forgery) ───────
  // Subscriptions are fixed by their Razorpay Plan, so only the one-time
  // order path needs an explicit amount check.
  if (!isSubscription && keyId) {
    try {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: secret })
      const payment = await razorpay.payments.fetch(razorpay_payment_id)
      const paid = Number(payment?.amount || 0)
      const okStatus = ['captured', 'authorized'].includes(payment?.status)
      if (!okStatus || paid < expectedPaise(plan, cycle)) {
        return res.status(400).json({ success: false, error: 'Payment amount mismatch' })
      }
    } catch (err) {
      console.error('payment fetch failed:', err)
      return res.status(502).json({ success: false, error: 'Could not verify payment with gateway' })
    }
  }

  // ── 4. Grant the plan server-side (clients can't write this table) ────────
  const periodEnd = new Date()
  if (cycle === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  else periodEnd.setMonth(periodEnd.getMonth() + 1)

  const row = {
    user_id: userId,
    plan,
    billing_cycle: cycle,
    razorpay_payment_id,
    status: 'active',
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (razorpay_subscription_id) row.razorpay_subscription_id = razorpay_subscription_id

  const admin = _create(supabaseUrl, serviceKey)
  const { error } = await admin.from('user_subscriptions').upsert(row, { onConflict: 'user_id' })
  if (error) {
    console.error('subscription grant failed:', error)
    return res.status(500).json({ success: false, error: 'Failed to activate subscription' })
  }

  return res.status(200).json({ success: true })
}
