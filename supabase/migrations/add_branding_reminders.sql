-- Client portal branding: Pro users can set a custom brand name shown on the client share page
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS client_brand_name text;

-- Email reminders: users can opt-in to receive email reminders for tasks due the next day
-- Triggered by the task-reminders edge function (requires RESEND_API_KEY in Supabase secrets)
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT false;
