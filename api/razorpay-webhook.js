import { createClient } from '@supabase/supabase-js'
import { hmac, safeEqual } from './_billing.js'

// The signature covers the exact bytes Razorpay sent, so read the raw body rather than a re-serialised object.
export const config = { api: { bodyParser: false } }

async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  const raw = await rawBody(req)
  if (!safeEqual(hmac(secret, raw), req.headers['x-razorpay-signature'])) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  let event, payload
  try { ({ event, payload } = JSON.parse(raw)) }
  catch { return res.status(400).json({ error: 'Invalid JSON' }) }

  try {
    if (event === 'subscription.charged') {
      // Recurring billing succeeded — extend period
      const sub = payload?.subscription?.entity
      const payment = payload?.payment?.entity
      if (sub?.id) {
        const periodEnd = new Date(sub.current_end * 1000)
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            current_period_end: periodEnd.toISOString(),
            razorpay_payment_id: payment?.id ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', sub.id)
      }
    }

    if (event === 'subscription.cancelled') {
      const sub = payload?.subscription?.entity
      if (sub?.id) {
        // Mark cancelling — access until period end (handled by getSubscription)
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelling', updated_at: new Date().toISOString() })
          .eq('razorpay_subscription_id', sub.id)
      }
    }

    if (event === 'subscription.completed' || event === 'subscription.expired') {
      const sub = payload?.subscription?.entity
      if (sub?.id) {
        await supabase
          .from('user_subscriptions')
          .update({ plan: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('razorpay_subscription_id', sub.id)
      }
    }

    if (event === 'payment.failed') {
      // Log for visibility — don't immediately downgrade, let period_end handle it
      console.log('Payment failed:', payload?.payment?.entity?.id)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
