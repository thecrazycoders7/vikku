import Razorpay from 'razorpay';

// Map plan + billing cycle to a Razorpay Plan ID (created in the Razorpay
// dashboard / API). Set these in your environment. If a plan ID is missing,
// the endpoint reports `configured: false` and the client falls back to a
// one-time GST-inclusive order.
const PLAN_ENV = {
  'pro:monthly':  'RAZORPAY_PLAN_PRO_MONTHLY',
  'pro:annual':   'RAZORPAY_PLAN_PRO_ANNUAL',
  'team:monthly': 'RAZORPAY_PLAN_TEAM_MONTHLY',
  'team:annual':  'RAZORPAY_PLAN_TEAM_ANNUAL',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, billingCycle = 'monthly', email } = req.body || {};
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    const envKey = PLAN_ENV[`${plan}:${cycle}`];
    const planId = envKey ? process.env[envKey] : null;

    // Not configured — tell the client to use the one-time order fallback.
    if (!planId) {
      return res.status(200).json({ configured: false });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // total_count = number of billing cycles before the subscription completes.
    // Use a long horizon so it renews "until cancelled".
    const totalCount = cycle === 'annual' ? 10 : 120; // ~10 years

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      customer_notify: 1,
      notes: { plan, billing_cycle: cycle, email: email || '' },
    });

    return res.status(200).json({
      configured: true,
      subscription_id: subscription.id,
    });
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);

    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Authentication failed. Check your Razorpay credentials.' });
    }

    return res.status(500).json({
      error: 'Failed to create subscription',

    });
  }
}
