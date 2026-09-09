CREATE TABLE IF NOT EXISTS pm_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_num text NOT NULL,
  issue_date date NOT NULL,
  due_date date,
  client_name text,
  client_email text,
  agency_name text,
  currency text DEFAULT 'INR',
  lines jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(12,2) DEFAULT 0,
  gst numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pm_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own invoices" ON pm_invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pm_invoices_project ON pm_invoices (project_id, created_at DESC);
