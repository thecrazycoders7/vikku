/**
 * One-off helper: creates the 4 Razorpay subscription Plans (Pro/Team ×
 * monthly/annual) with GST-inclusive amounts, then prints the env vars to
 * paste into Vercel.
 *
 * Run once:
 *   RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=xxx node scripts/create-razorpay-plans.mjs
 *
 * Amounts must match priceBreakdown() in src/lib/razorpayService.js
 * (base price + 18% GST), expressed in paise.
 */
import Razorpay from 'razorpay'

const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

if (!KEY_ID || !KEY_SECRET) {
  console.error('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars first.')
  process.exit(1)
}

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })

const GST = 0.18
const base = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}
const gstInclusivePaise = (rupees) => {
  const basePaise = rupees * 100
  return basePaise + Math.round(basePaise * GST)
}

// [envVar, plan, cycle, period, displayName]
const PLANS = [
  ['RAZORPAY_PLAN_PRO_MONTHLY',  'pro',  'monthly', 'monthly', 'Vikku PM Pro (Monthly)'],
  ['RAZORPAY_PLAN_PRO_ANNUAL',   'pro',  'annual',  'yearly',  'Vikku PM Pro (Annual)'],
  ['RAZORPAY_PLAN_TEAM_MONTHLY', 'team', 'monthly', 'monthly', 'Vikku PM Team (Monthly)'],
  ['RAZORPAY_PLAN_TEAM_ANNUAL',  'team', 'annual',  'yearly',  'Vikku PM Team (Annual)'],
]

const out = []
for (const [envVar, plan, cycle, period, name] of PLANS) {
  const amount = gstInclusivePaise(base[plan][cycle])
  try {
    const created = await razorpay.plans.create({
      period,
      interval: 1,
      item: {
        name,
        amount,
        currency: 'INR',
        description: `${name} — incl. 18% GST`,
      },
    })
    console.log(`✓ ${name}: ${created.id}  (₹${(amount / 100).toFixed(2)})`)
    out.push(`${envVar}=${created.id}`)
  } catch (err) {
    console.error(`✗ ${name} failed:`, err?.error?.description || err.message)
  }
}

console.log('\n── Paste these into Vercel → Settings → Environment Variables ──\n')
console.log(out.join('\n'))
