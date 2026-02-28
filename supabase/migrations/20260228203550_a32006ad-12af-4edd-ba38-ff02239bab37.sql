
-- Create rdos table
CREATE TABLE public.rdos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  date date NOT NULL,
  activities text DEFAULT '' ,
  observations text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, date)
);

-- Create rdo_team_members table
CREATE TABLE public.rdo_team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rdo_id uuid NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text DEFAULT '',
  hours_worked numeric(4,1) NOT NULL DEFAULT 0
);

-- Create rdo_photos table
CREATE TABLE public.rdo_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rdo_id uuid NOT NULL REFERENCES public.rdos(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text DEFAULT '',
  annotations_json jsonb DEFAULT null,
  sort_order integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_photos ENABLE ROW LEVEL SECURITY;

-- RLS for rdos
CREATE POLICY "Owner can view rdos" ON public.rdos FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = rdos.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create rdos" ON public.rdos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = rdos.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update rdos" ON public.rdos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = rdos.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete rdos" ON public.rdos FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = rdos.project_id AND projects.owner_id = auth.uid()));

-- RLS for rdo_team_members (via rdos join)
CREATE POLICY "Owner can view rdo_team_members" ON public.rdo_team_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create rdo_team_members" ON public.rdo_team_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update rdo_team_members" ON public.rdo_team_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete rdo_team_members" ON public.rdo_team_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND projects.owner_id = auth.uid()));

-- RLS for rdo_photos (via rdos join)
CREATE POLICY "Owner can view rdo_photos" ON public.rdo_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create rdo_photos" ON public.rdo_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update rdo_photos" ON public.rdo_photos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete rdo_photos" ON public.rdo_photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND projects.owner_id = auth.uid()));

-- Trigger updated_at on rdos
CREATE TRIGGER update_rdos_updated_at
  BEFORE UPDATE ON public.rdos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for rdo photos
INSERT INTO storage.buckets (id, name, public) VALUES ('rdo-photos', 'rdo-photos', true);

-- Storage RLS policies
CREATE POLICY "Owner can upload rdo photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rdo-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view rdo photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'rdo-photos');
CREATE POLICY "Owner can delete rdo photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'rdo-photos' AND auth.uid() IS NOT NULL);
