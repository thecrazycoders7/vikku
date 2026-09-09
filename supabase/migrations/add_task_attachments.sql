-- Run this in the Supabase SQL editor

-- 1. Task attachments table
CREATE TABLE IF NOT EXISTS pm_task_attachments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid        REFERENCES pm_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name   text        NOT NULL,
  file_path   text        NOT NULL,
  file_size   bigint,
  mime_type   text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE pm_task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own attachments" ON pm_task_attachments
  FOR ALL USING (auth.uid() = user_id);

-- 2. Storage bucket for PM attachments (10 MB per file limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('pm-attachments', 'pm-attachments', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
CREATE POLICY "Authenticated users upload attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pm-attachments');

CREATE POLICY "Users read own attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pm-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pm-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
