
-- Add type and cover_image_url columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS type text DEFAULT 'residencial';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image_url text;
