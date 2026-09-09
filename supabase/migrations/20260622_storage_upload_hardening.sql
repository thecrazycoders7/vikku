DROP POLICY IF EXISTS "Authenticated users upload attachments" ON storage.objects;
CREATE POLICY "Users upload to own folder, safe types" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pm-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp','gif','pdf','doc','docx','xls','xlsx','csv','txt')
  );
