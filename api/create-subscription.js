import Razorpay from 'razorpay'
import { adminClient, callerOf } from './_auth.js'
import { planOf, planIdFor, razorpayKeys } from './_billing.js'

// Auto-renewing subscription for a Vikku PM plan. Needs the RAZORPAY_PLAN_* ids in Vercel; without one
// it answers { configured: false } and the browser falls back to a one-time order.
// The buyer and plan go into the subscription's notes, which verify-payment checks.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const p = planOf(req.body?.plan, req.body?.billingCycle)
  if (!p) return res.status(400).json({ error: 'Unknown plan' })
  const planId = planIdFor(p)
  if (!planId) return res.status(200).json({ configured: false })

  const admin = adminClient()
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' })
  const caller = await callerOf(req, admin)
  if (!caller) return res.status(401).json({ error: 'Please sign in to upgrade.' })

  try {
    const razorpay = new Razorpay(razorpayKeys())
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: p.cycle === 'annual' ? 10 : 120, // ~10 years, i.e. renews until cancelled
      customer_notify: 1,
      notes: { user_id: caller.id, plan: p.plan, billing_cycle: p.cycle, email: caller.email || '' },
    })
    return res.status(200).json({ configured: true, subscription_id: subscription.id })
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    return res.status(500).json({ error: 'Failed to create subscription' })
  }
}
