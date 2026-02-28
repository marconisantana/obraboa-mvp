
-- Create stages table
CREATE TABLE public.stages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '' ,
  service_type text NOT NULL DEFAULT 'general',
  environment text DEFAULT '',
  responsible_name text DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  progress integer NOT NULL DEFAULT 0,
  predecessor_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- RLS policies via project owner
CREATE POLICY "Owner can view stages" ON public.stages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = stages.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "Owner can create stages" ON public.stages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = stages.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "Owner can update stages" ON public.stages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = stages.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "Owner can delete stages" ON public.stages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = stages.project_id AND projects.owner_id = auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_stages_project_id ON public.stages(project_id);
CREATE INDEX idx_stages_predecessor_id ON public.stages(predecessor_id);
