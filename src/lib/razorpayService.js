import { supabase } from './supabaseClient'

// India GST on SaaS subscriptions
export const GST_RATE = 0.18

// Base (pre-GST) prices in rupees
export const PLAN_PRICING = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}

// Normalized monthly recurring revenue (pre-GST) for a subscription.
// Annual plans are divided by 12 so MRR is comparable across cycles.
export function monthlyRevenue(plan, billingCycle = 'monthly') {
  const p = PLAN_PRICING[plan]
  if (!p) return 0
  return billingCycle === 'annual' ? p.annual / 12 : p.monthly
}

const PLAN_META = {
  pro:  { name: 'Vikku PM Pro',  description: 'Unlimited projects, AI planning, client share links' },
  team: { name: 'Vikku PM Team', description: 'Everything in Pro + unlimited team members' },
}

/**
 * GST-inclusive price breakdown for a plan + billing cycle.
 * All rupee values; `totalPaise` is what we actually charge.
 */
export function priceBreakdown(plan, billingCycle = 'monthly') {
  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
  const basePaise = (PLAN_PRICING[plan]?.[cycle] ?? 0) * 100
  const gstPaise = Math.round(basePaise * GST_RATE)
  const totalPaise = basePaise + gstPaise
  return {
    base: basePaise / 100,
    gst: gstPaise / 100,
    total: totalPaise / 100,
    totalPaise,
  }
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout({ plan, billingCycle = 'monthly', mode = 'subscription', user, onSuccess, onFailure, onDismiss }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Failed to load payment gateway. Please try again.')
    return
  }

  const meta = PLAN_META[plan]
  if (!meta) { onFailure?.('Invalid plan'); return }

  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
  const { totalPaise } = priceBreakdown(plan, cycle)

  // ── Try an auto-renewing subscription first ──────────────────────────────
  // Needs Razorpay Plan IDs configured server-side. If not configured, the
  // endpoint returns { configured: false } and we fall back to a one-time order.
  // Skipped entirely in 'once' mode - a one-time order gives a reliable UPI QR
  // (recurring UPI-Autopay mandate QRs cannot be scanned by most UPI apps).
  let subscriptionId = null
  if (mode === 'subscription') {
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle: cycle, email: user?.email || '' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.configured && data.subscription_id) subscriptionId = data.subscription_id
      }
    } catch {
      // ignore - fall back to one-time order
    }
  }

  // ── Fallback: one-time order (GST-inclusive) ─────────────────────────────
  let orderId = null
  if (!subscriptionId) {
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPaise,
          currency: 'INR',
          receipt: `sub_${plan}_${cycle}_${Date.now()}`,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        orderId = data.order_id
      }
    } catch {
      // handled below
    }
  }

  // We must have a server-created order or subscription - otherwise the payment
  // can't be verified server-side, and we never grant a plan without verification.
  if (!subscriptionId && !orderId) {
    onFailure?.('Could not start a secure checkout. Please try again.')
    return
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    name: 'Vikku PM',
    description: `${meta.description} (incl. 18% GST)`,
    image: '/logo.png',
    prefill: { email: user?.email || '' },
    theme: { color: '#ffffff' },
    ...(subscriptionId
      ? { subscription_id: subscriptionId }
      : { amount: totalPaise, currency: 'INR', order_id: orderId }),
    handler: async (response) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token || ''
        // The server verifies the signature + amount and grants the plan with
        // the service-role key. The client never writes the subscription itself.
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            plan,
            billingCycle: cycle,
          }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed')
        onSuccess?.(response)
      } catch (err) {
        onFailure?.(err.message)
      }
    },
    modal: { ondismiss: () => { onDismiss?.() } },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed')
  })
  rzp.open()
}

export async function getSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { plan: 'free' }

    // Immediately cancelled - no access
    if (data.status === 'cancelled') return { ...data, plan: 'free' }

    // Period has ended - treat as free. (The DB row is reconciled server-side
    // by the Razorpay webhook; clients can't write this table.)
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
      return { plan: 'free' }
    }

    // Cancelling but still within paid period - keep access
    return data
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
    return { plan: 'free' }
  }
}

// Sets status to 'cancelling' - user keeps Pro access until current_period_end.
// The status flip + Razorpay cancellation happen server-side (clients cannot
// write user_subscriptions).
export async function cancelSubscription(userId) {
  if (!supabase) throw new Error('Database not configured')

  // Reading own subscription is allowed by RLS
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('current_period_end, razorpay_subscription_id')
    .eq('user_id', userId)
    .single()

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  const res = await fetch('/api/cancel-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ subscription_id: sub?.razorpay_subscription_id || null }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to cancel subscription')
  }
  const data = await res.json()
  return { accessUntil: data.accessUntil ?? sub?.current_period_end }
}
