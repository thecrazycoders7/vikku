import crypto from 'crypto'

// Pure helpers for the Razorpay endpoints (create-order, create-subscription, verify-payment, webhook).
// Files starting with "_" are not deployed as endpoints. Tested by api/_billing.test.mjs.

// Prices in rupees. Mirrors PLAN_PRICING in src/lib/razorpayService.js.
export const PRICES = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}

export const PLAN_ENV = {
  'pro:monthly':  'RAZORPAY_PLAN_PRO_MONTHLY',
  'pro:annual':   'RAZORPAY_PLAN_PRO_ANNUAL',
  'team:monthly': 'RAZORPAY_PLAN_TEAM_MONTHLY',
  'team:annual':  'RAZORPAY_PLAN_TEAM_ANNUAL',
}
export const planIdFor = ({ plan, cycle }, env = process.env) => env[PLAN_ENV[`${plan}:${cycle}`]] || null

export const planOf = (plan, cycle) => (PRICES[plan] ? { plan, cycle: cycle === 'annual' ? 'annual' : 'monthly' } : null)
export const pricePaise = ({ plan, cycle }) => PRICES[plan][cycle] * 100

// Constant-time comparison for signatures.
export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? '')), y = Buffer.from(String(b ?? ''))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export const hmac = (secret, body) => crypto.createHmac('sha256', secret).update(body).digest('hex')

const MAX_PAYMENT_AGE_S = 24 * 3600 // verify runs right after checkout; an old payment is a replay
const fail = (error) => ({ ok: false, error })

// One-time order: api/create-order wrote the buyer and plan into the order's notes, so the plan comes
// from Razorpay, not the browser, and a payment can't be applied to another account.
export function checkOrderPayment({ userId, order, payment, nowS }) {
  const n = order?.notes || {}
  if (!userId || n.user_id !== userId) return fail('This payment belongs to another account.')
  const p = planOf(n.plan, n.billing_cycle)
  if (!p) return fail('Unknown plan.')
  if (!payment || payment.order_id !== order.id) return fail('Payment does not match the order.')
  if (!['captured', 'authorized'].includes(payment.status)) return fail('Payment not completed.')
  if (Number(payment.amount) < pricePaise(p)) return fail('Payment amount mismatch.')
  if (nowS - Number(payment.created_at) > MAX_PAYMENT_AGE_S) return fail('This payment is too old to apply.')
  return { ok: true, ...p }
}

// Subscription: same idea, from the subscription's notes and its Razorpay plan id.
export function checkSubscription({ userId, sub, env = process.env }) {
  const n = sub?.notes || {}
  if (!userId || n.user_id !== userId) return fail('This subscription belongs to another account.')
  const p = planOf(n.plan, n.billing_cycle)
  if (!p) return fail('Unknown plan.')
  if (!sub.plan_id || planIdFor(p, env) !== sub.plan_id) return fail('Subscription plan mismatch.')
  if (!['authenticated', 'active'].includes(sub.status)) return fail('Subscription is not active.')
  return { ok: true, ...p }
}
