-- SECURITY: clients must NOT be able to grant themselves a paid plan.
-- Reads are limited to a user's own row; ALL writes go through service-role
-- server code (api/verify-payment, api/cancel-subscription, api/razorpay-webhook),
-- which bypasses RLS. No client INSERT/UPDATE/DELETE policy is granted.

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own subscription" ON user_subscriptions;
CREATE POLICY "read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Intentionally NO insert/update/delete policies:
-- with RLS enabled and no write policy, clients are denied all writes,
-- while the service-role key (server) bypasses RLS for legitimate grants.
