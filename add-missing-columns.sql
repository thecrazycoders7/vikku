-- ============================================
-- Add Missing Columns to Existing Tables
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Add missing columns to pm_tasks table
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add missing columns to pm_projects (if needed)
ALTER TABLE pm_projects 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');

-- Create index for assigned_to
CREATE INDEX IF NOT EXISTS idx_pm_tasks_assigned_to ON pm_tasks(assigned_to);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'pm_tasks'
ORDER BY ordinal_position;
