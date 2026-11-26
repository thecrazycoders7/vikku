import Razorpay from 'razorpay'
import { adminClient, callerOf } from './_auth.js'
import { hmac, safeEqual, checkOrderPayment, checkSubscription, razorpayKeys } from './_billing.js'

// Confirms a Razorpay checkout and grants the plan. The signature proves Razorpay sent the ids; the
// plan and the buyer come from the order or subscription notes written by create-order /
// create-subscription, so a payment can't be replayed on another account or upgraded to a bigger plan.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const admin = adminClient()
  const { key_id: keyId, key_secret: secret } = razorpayKeys()
  if (!admin || !keyId || !secret) return res.status(500).json({ success: false, error: 'Server misconfigured' })

  const caller = await callerOf(req, admin)
  if (!caller) return res.status(401).json({ success: false, error: 'Unauthorized' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body || {}
  if (!razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, error: 'Missing required fields' })

  // Subscription: HMAC(payment_id | subscription_id). One-time order: HMAC(order_id | payment_id).
  const isSubscription = !!razorpay_subscription_id
  if (!isSubscription && !razorpay_order_id) return res.status(400).json({ success: false, error: 'Missing order or subscription id' })
  const signed = isSubscription ? `${razorpay_payment_id}|${razorpay_subscription_id}` : `${razorpay_order_id}|${razorpay_payment_id}`
  if (!safeEqual(hmac(secret, signed), razorpay_signature)) return res.status(400).json({ success: false, error: 'Invalid payment signature' })

  let check
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: secret })
    if (isSubscription) {
      check = checkSubscription({ userId: caller.id, sub: await razorpay.subscriptions.fetch(razorpay_subscription_id) })
    } else {
      const [order, payment] = await Promise.all([razorpay.orders.fetch(razorpay_order_id), razorpay.payments.fetch(razorpay_payment_id)])
      check = checkOrderPayment({ userId: caller.id, order, payment, nowS: Math.floor(Date.now() / 1000) })
    }
  } catch (err) {
    console.error('Razorpay lookup failed:', err)
    return res.status(502).json({ success: false, error: 'Could not verify payment with gateway' })
  }
  if (!check.ok) return res.status(400).json({ success: false, error: check.error })

  // Already applied (a retry or a replay): don't push the period end out again.
  const { data: current } = await admin.from('user_subscriptions').select('razorpay_payment_id').eq('user_id', caller.id).maybeSingle()
  if (current?.razorpay_payment_id === razorpay_payment_id) return res.status(200).json({ success: true })

  const periodEnd = new Date()
  if (check.cycle === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  else periodEnd.setMonth(periodEnd.getMonth() + 1)

  const row = {
    user_id: caller.id,
    plan: check.plan,
    billing_cycle: check.cycle,
    razorpay_payment_id,
    status: 'active',
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (isSubscription) row.razorpay_subscription_id = razorpay_subscription_id

  const { error } = await admin.from('user_subscriptions').upsert(row, { onConflict: 'user_id' })
  if (error) {
    console.error('subscription grant failed:', error)
    return res.status(500).json({ success: false, error: 'Failed to activate subscription' })
  }
  return res.status(200).json({ success: true })
}
