import Razorpay from 'razorpay'
import { adminClient, callerOf } from './_auth.js'
import { planOf, pricePaise, razorpayKeys } from './_billing.js'

// One-time order for a Vikku PM plan. The price comes from the plan, never the browser, and the buyer
// and plan are written into the order's notes so verify-payment can only apply it to this account.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const admin = adminClient()
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' })
  const caller = await callerOf(req, admin)
  if (!caller) return res.status(401).json({ error: 'Please sign in to upgrade.' })

  const p = planOf(req.body?.plan, req.body?.billingCycle)
  if (!p) return res.status(400).json({ error: 'Unknown plan' })

  try {
    const razorpay = new Razorpay(razorpayKeys())
    const order = await razorpay.orders.create({
      amount: pricePaise(p),
      currency: 'INR',
      receipt: `${p.plan}_${p.cycle}_${Date.now()}`,
      notes: { user_id: caller.id, plan: p.plan, billing_cycle: p.cycle },
    })
    return res.status(200).json({ order_id: order.id, amount: order.amount, currency: order.currency })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return res.status(500).json({ error: 'Failed to create order' })
  }
}
