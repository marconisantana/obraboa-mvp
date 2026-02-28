
-- Create document_folders table
CREATE TABLE public.document_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.document_folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid()
);

-- Create document_files table
CREATE TABLE public.document_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_folders
CREATE POLICY "Owner can view document_folders" ON public.document_folders
  FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_folders.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can create document_folders" ON public.document_folders
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_folders.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can update document_folders" ON public.document_folders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_folders.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can delete document_folders" ON public.document_folders
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_folders.project_id AND projects.owner_id = auth.uid()));

-- RLS policies for document_files
CREATE POLICY "Owner can view document_files" ON public.document_files
  FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_files.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can create document_files" ON public.document_files
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_files.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can update document_files" ON public.document_files
  FOR UPDATE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_files.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Owner can delete document_files" ON public.document_files
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = document_files.project_id AND projects.owner_id = auth.uid()));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', true);

-- Storage policies
CREATE POLICY "Project owner can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Project owner can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-documents');

CREATE POLICY "Project owner can delete documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');
