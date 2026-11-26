import Razorpay from 'razorpay';
import { adminClient, callerOf } from './_auth.js';
import { razorpayKeys } from './_billing.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = adminClient();
    if (!admin) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // Authenticate caller via JWT — never trust userId from request body
    const caller = await callerOf(req, admin);
    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = caller.id;

    // Only the caller's own subscription, as stored when it was granted - never an id from the request.
    const { data: own } = await admin
      .from('user_subscriptions')
      .select('razorpay_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();
    const subscription_id = own?.razorpay_subscription_id;

    // Stop auto-renewal at Razorpay (best-effort; access stays until period end)
    const keys = razorpayKeys();
    if (subscription_id && keys.key_id && keys.key_secret) {
      try {
        const razorpay = new Razorpay(keys);
        await razorpay.subscriptions.cancel(subscription_id, true); // cancel at cycle end
      } catch (err) {
        console.error('Razorpay cancel failed (continuing):', err?.message);
      }
    }

    // Mark cancelling — user keeps access until current_period_end
    const { data, error } = await admin
      .from('user_subscriptions')
      .update({ status: 'cancelling', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('current_period_end')
      .single();

    if (error) {
      console.error('cancel update failed:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    return res.status(200).json({ success: true, accessUntil: data?.current_period_end });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
