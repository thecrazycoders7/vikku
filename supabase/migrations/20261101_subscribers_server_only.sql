-- ============================================================================
-- Website sign-ups only through the server (api/subscribe.js, api/send-tool-result.js).
--
-- The footer and free-tool forms used to insert into `subscribers` straight from the browser
-- with the public key, so bots could add rows (and, through the CRM trigger, junk leads)
-- without ever loading the site. The server endpoints check every sign-up first (hidden trap
-- field, too-fast submits, invalid and throwaway emails) and write with the service role,
-- which this doesn't affect.
--
-- Run AFTER the matching website deploy is live (the old forms need the insert). Safe to re-run.
-- ============================================================================

revoke insert, update, delete on table subscribers from anon, authenticated;

notify pgrst, 'reload schema';
