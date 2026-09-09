-- Auto-renewing subscriptions + billing cycle support.
-- Safe to run repeatedly (IF NOT EXISTS).

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';

-- The webhook looks subscriptions up by their Razorpay subscription id.
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_sub
  ON user_subscriptions (razorpay_subscription_id);
