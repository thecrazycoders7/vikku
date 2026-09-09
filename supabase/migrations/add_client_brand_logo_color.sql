-- Client portal branding: logo URL and accent color for Pro users
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS client_brand_logo text;
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS client_brand_color text;
