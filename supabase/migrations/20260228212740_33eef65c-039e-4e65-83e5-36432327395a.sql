
-- Create project_references table
CREATE TABLE public.project_references (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  image_url text NOT NULL,
  storage_path text,
  category text NOT NULL DEFAULT 'outros',
  observation text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_references ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Owner can view project_references"
  ON public.project_references FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_references.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can create project_references"
  ON public.project_references FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_references.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can update project_references"
  ON public.project_references FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_references.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can delete project_references"
  ON public.project_references FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_references.project_id AND projects.owner_id = auth.uid()));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('reference-images', 'reference-images', true);

-- Storage RLS policies
CREATE POLICY "Owner can upload reference images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reference-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view reference images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reference-images');

CREATE POLICY "Owner can delete reference images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'reference-images' AND auth.role() = 'authenticated');
