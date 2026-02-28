
-- Checklists table
CREATE TABLE public.checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  responsible_name text DEFAULT '',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view checklists" ON public.checklists FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = checklists.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create checklists" ON public.checklists FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = checklists.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update checklists" ON public.checklists FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = checklists.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete checklists" ON public.checklists FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = checklists.project_id AND projects.owner_id = auth.uid()));

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Checklist items table
CREATE TABLE public.checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  text text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  responsible_name text DEFAULT '',
  due_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view checklist_items" ON public.checklist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create checklist_items" ON public.checklist_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update checklist_items" ON public.checklist_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete checklist_items" ON public.checklist_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND projects.owner_id = auth.uid()));

-- Checklist item photos table
CREATE TABLE public.checklist_item_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_item_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view checklist_item_photos" ON public.checklist_item_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create checklist_item_photos" ON public.checklist_item_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete checklist_item_photos" ON public.checklist_item_photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND projects.owner_id = auth.uid()));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('checklist-photos', 'checklist-photos', true);

CREATE POLICY "Owner can upload checklist photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'checklist-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view checklist photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'checklist-photos');
CREATE POLICY "Owner can delete checklist photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'checklist-photos' AND auth.role() = 'authenticated');
