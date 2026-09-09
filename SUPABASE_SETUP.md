# 🚀 Supabase Setup Guide for Vikku PM

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** Vikku PM
   - **Database Password:** (save this somewhere safe)
   - **Region:** Choose closest to you (e.g., Mumbai for India)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` in this project
4. **Copy all the SQL code** from that file
5. **Paste it** into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: **"Success. No rows returned"**

This creates all the tables:
- ✅ `pm_projects`
- ✅ `pm_tasks`
- ✅ `pm_milestones`
- ✅ `pm_project_members`
- ✅ `user_subscriptions`

---

## Step 3: Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:

   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Step 4: Add to .env File

1. Open your `.env` file (create it if it doesn't exist)
2. Add these lines:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Step 3.

---

## Step 5: Restart Dev Server

1. Stop your dev server (Ctrl+C in terminal)
2. Start it again:
```bash
npm run dev
```

---

## Step 6: Test Authentication

1. Go to http://localhost:5174/signup
2. Create a test account
3. Check your email for confirmation (if email is enabled)
4. Or go to Supabase → **Authentication** → **Users** to see your new user

---

## Step 7: Test PM Features

1. Go to http://localhost:5174/pm/dashboard
2. Click **"New Project"**
3. Fill in the form and create a project
4. You should see your project in the dashboard!

---

## ✅ Verification

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see 5 tables and multiple policies.

---

## 🔒 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only see their own data
- ✅ Share tokens allow client-only view access
- ✅ API keys are safe to expose (anon key is public)

---

## 🐛 Troubleshooting

### "relation does not exist" error
- Run the `supabase-schema.sql` file in SQL Editor

### "infinite recursion detected" error
- RLS policies have circular references
- Drop and recreate policies using the schema file

### "Failed to fetch" error
- Check if Supabase URL and anon key are correct in `.env`
- Make sure `.env` variables start with `VITE_`
- Restart dev server after changing `.env`

### Can't sign up / login
- Check Supabase → **Authentication** → **Providers**
- Make sure "Email" provider is enabled
- Check "Email Auth" settings

---

## 📊 Database Structure

```
pm_projects (main table)
├── id (UUID, primary key)
├── user_id (references auth.users)
├── name, description, client info
├── color, status
└── share_token (for client access)

pm_tasks
├── id (UUID)
├── project_id (references pm_projects)
├── title, description
├── status (todo/in_progress/review/done)
└── priority (low/medium/high/urgent)

pm_milestones
├── id (UUID)
├── project_id (references pm_projects)
├── title, due_date
└── completed (boolean)

pm_project_members
├── id (UUID)
├── project_id (references pm_projects)
├── user_id (references auth.users)
└── role (owner/admin/member/viewer)

user_subscriptions
├── id (UUID)
├── user_id (references auth.users)
├── plan (free/pro/team)
├── status (active/cancelled/expired)
└── razorpay_payment_id
```

---

## 🎉 You're Done!

Your Supabase database is now set up and ready to use with the Vikku PM app.

**Next Steps:**
- Create a test project
- Invite team members
- Try the AI planning features
- Test the client share link

For issues, check the browser console and Supabase logs.
