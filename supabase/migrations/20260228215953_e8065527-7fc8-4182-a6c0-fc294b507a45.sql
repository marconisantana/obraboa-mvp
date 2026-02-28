
-- =============================================
-- 1. NEW TABLES: project_members, project_invites
-- =============================================

CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, profile_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.project_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. ADD MISSING COLUMNS
-- =============================================

ALTER TABLE public.rdos ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE public.purchase_order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC NOT NULL DEFAULT 0;

-- =============================================
-- 3. SECURITY DEFINER HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.profiles p ON p.id = pm.profile_id
    WHERE pm.project_id = _project_id
    AND p.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_project_role(_project_id UUID, _user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pm.role FROM public.project_members pm
  JOIN public.profiles p ON p.id = pm.profile_id
  WHERE pm.project_id = _project_id
  AND p.user_id = _user_id
  LIMIT 1;
$$;

-- =============================================
-- 4. AUTO-MEMBERSHIP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.auto_create_project_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
BEGIN
  SELECT id INTO _profile_id FROM public.profiles WHERE user_id = NEW.owner_id;
  IF _profile_id IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, profile_id, role)
    VALUES (NEW.id, _profile_id, 'owner')
    ON CONFLICT (project_id, profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_project_member
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_project_member();

-- =============================================
-- 5. MIGRATE EXISTING PROJECTS TO project_members
-- =============================================

INSERT INTO public.project_members (project_id, profile_id, role)
SELECT p.id, pr.id, 'owner'
FROM public.projects p
JOIN public.profiles pr ON pr.user_id = p.owner_id
ON CONFLICT (project_id, profile_id) DO NOTHING;

-- =============================================
-- 6. RLS POLICIES FOR project_members
-- =============================================

-- Members can see other members of the same project
CREATE POLICY "Members can view project members"
ON public.project_members FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

-- Only owner can add members
CREATE POLICY "Owner can insert project members"
ON public.project_members FOR INSERT
TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- Only owner can remove members
CREATE POLICY "Owner can delete project members"
ON public.project_members FOR DELETE
TO authenticated
USING (public.get_project_role(project_id, auth.uid()) = 'owner');

-- Only owner can update member roles
CREATE POLICY "Owner can update project members"
ON public.project_members FOR UPDATE
TO authenticated
USING (public.get_project_role(project_id, auth.uid()) = 'owner');

-- =============================================
-- 7. RLS POLICIES FOR project_invites
-- =============================================

CREATE POLICY "Members can view invites"
ON public.project_invites FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create invites"
ON public.project_invites FOR INSERT
TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner can delete invites"
ON public.project_invites FOR DELETE
TO authenticated
USING (public.get_project_role(project_id, auth.uid()) = 'owner');

-- =============================================
-- 8. UPDATE EXISTING RLS TO MEMBERSHIP-BASED
-- =============================================

-- PROJECTS: keep INSERT as owner_id = auth.uid(), update SELECT to membership, keep UPDATE/DELETE as owner
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Members can view projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.is_project_member(id, auth.uid()));

-- Keep INSERT, UPDATE, DELETE as-is (owner_id = auth.uid()) since those are correct

-- ACTIVITIES: update to membership-based
DROP POLICY IF EXISTS "Users can view activities of their projects" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities in their projects" ON public.activities;

CREATE POLICY "Members can view activities"
ON public.activities FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- STAGES
DROP POLICY IF EXISTS "Owner can view stages" ON public.stages;
DROP POLICY IF EXISTS "Owner can create stages" ON public.stages;
DROP POLICY IF EXISTS "Owner can update stages" ON public.stages;
DROP POLICY IF EXISTS "Owner can delete stages" ON public.stages;

CREATE POLICY "Members can view stages"
ON public.stages FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create stages"
ON public.stages FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update stages"
ON public.stages FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete stages"
ON public.stages FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- RDOS
DROP POLICY IF EXISTS "Owner can view rdos" ON public.rdos;
DROP POLICY IF EXISTS "Owner can create rdos" ON public.rdos;
DROP POLICY IF EXISTS "Owner can update rdos" ON public.rdos;
DROP POLICY IF EXISTS "Owner can delete rdos" ON public.rdos;

CREATE POLICY "Members can view rdos"
ON public.rdos FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create rdos"
ON public.rdos FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update rdos"
ON public.rdos FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete rdos"
ON public.rdos FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- RDO_PHOTOS
DROP POLICY IF EXISTS "Owner can view rdo_photos" ON public.rdo_photos;
DROP POLICY IF EXISTS "Owner can create rdo_photos" ON public.rdo_photos;
DROP POLICY IF EXISTS "Owner can update rdo_photos" ON public.rdo_photos;
DROP POLICY IF EXISTS "Owner can delete rdo_photos" ON public.rdo_photos;

CREATE POLICY "Members can view rdo_photos"
ON public.rdo_photos FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create rdo_photos"
ON public.rdo_photos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can update rdo_photos"
ON public.rdo_photos FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete rdo_photos"
ON public.rdo_photos FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_photos.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- RDO_TEAM_MEMBERS
DROP POLICY IF EXISTS "Owner can view rdo_team_members" ON public.rdo_team_members;
DROP POLICY IF EXISTS "Owner can create rdo_team_members" ON public.rdo_team_members;
DROP POLICY IF EXISTS "Owner can update rdo_team_members" ON public.rdo_team_members;
DROP POLICY IF EXISTS "Owner can delete rdo_team_members" ON public.rdo_team_members;

CREATE POLICY "Members can view rdo_team_members"
ON public.rdo_team_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create rdo_team_members"
ON public.rdo_team_members FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can update rdo_team_members"
ON public.rdo_team_members FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete rdo_team_members"
ON public.rdo_team_members FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM rdos JOIN projects ON projects.id = rdos.project_id WHERE rdos.id = rdo_team_members.rdo_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- CHECKLISTS
DROP POLICY IF EXISTS "Owner can view checklists" ON public.checklists;
DROP POLICY IF EXISTS "Owner can create checklists" ON public.checklists;
DROP POLICY IF EXISTS "Owner can update checklists" ON public.checklists;
DROP POLICY IF EXISTS "Owner can delete checklists" ON public.checklists;

CREATE POLICY "Members can view checklists"
ON public.checklists FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create checklists"
ON public.checklists FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update checklists"
ON public.checklists FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete checklists"
ON public.checklists FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- CHECKLIST_ITEMS
DROP POLICY IF EXISTS "Owner can view checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Owner can create checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Owner can update checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Owner can delete checklist_items" ON public.checklist_items;

CREATE POLICY "Members can view checklist_items"
ON public.checklist_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create checklist_items"
ON public.checklist_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can update checklist_items"
ON public.checklist_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete checklist_items"
ON public.checklist_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM checklists JOIN projects ON projects.id = checklists.project_id WHERE checklists.id = checklist_items.checklist_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- CHECKLIST_ITEM_PHOTOS
DROP POLICY IF EXISTS "Owner can view checklist_item_photos" ON public.checklist_item_photos;
DROP POLICY IF EXISTS "Owner can create checklist_item_photos" ON public.checklist_item_photos;
DROP POLICY IF EXISTS "Owner can delete checklist_item_photos" ON public.checklist_item_photos;

CREATE POLICY "Members can view checklist_item_photos"
ON public.checklist_item_photos FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create checklist_item_photos"
ON public.checklist_item_photos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete checklist_item_photos"
ON public.checklist_item_photos FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM checklist_items JOIN checklists ON checklists.id = checklist_items.checklist_id JOIN projects ON projects.id = checklists.project_id WHERE checklist_items.id = checklist_item_photos.item_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- PURCHASE_ORDERS
DROP POLICY IF EXISTS "Owner can view purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Owner can create purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Owner can update purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Owner can delete purchase_orders" ON public.purchase_orders;

CREATE POLICY "Members can view purchase_orders"
ON public.purchase_orders FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create purchase_orders"
ON public.purchase_orders FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update purchase_orders"
ON public.purchase_orders FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete purchase_orders"
ON public.purchase_orders FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- PURCHASE_ORDER_ITEMS
DROP POLICY IF EXISTS "Owner can view purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Owner can create purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Owner can update purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Owner can delete purchase_order_items" ON public.purchase_order_items;

CREATE POLICY "Members can view purchase_order_items"
ON public.purchase_order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create purchase_order_items"
ON public.purchase_order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can update purchase_order_items"
ON public.purchase_order_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete purchase_order_items"
ON public.purchase_order_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- DOSSIERS
DROP POLICY IF EXISTS "Owner can view dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "Owner can create dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "Owner can update dossiers" ON public.dossiers;
DROP POLICY IF EXISTS "Owner can delete dossiers" ON public.dossiers;

CREATE POLICY "Members can view dossiers"
ON public.dossiers FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create dossiers"
ON public.dossiers FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update dossiers"
ON public.dossiers FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete dossiers"
ON public.dossiers FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- DOSSIER_PAYMENTS
DROP POLICY IF EXISTS "Owner can view dossier_payments" ON public.dossier_payments;
DROP POLICY IF EXISTS "Owner can create dossier_payments" ON public.dossier_payments;
DROP POLICY IF EXISTS "Owner can update dossier_payments" ON public.dossier_payments;
DROP POLICY IF EXISTS "Owner can delete dossier_payments" ON public.dossier_payments;

CREATE POLICY "Members can view dossier_payments"
ON public.dossier_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND public.is_project_member(projects.id, auth.uid())));

CREATE POLICY "Owner/professional can create dossier_payments"
ON public.dossier_payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can update dossier_payments"
ON public.dossier_payments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

CREATE POLICY "Owner/professional can delete dossier_payments"
ON public.dossier_payments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND public.get_project_role(projects.id, auth.uid()) IN ('owner', 'professional')));

-- DOCUMENT_FOLDERS
DROP POLICY IF EXISTS "Owner can view document_folders" ON public.document_folders;
DROP POLICY IF EXISTS "Owner can create document_folders" ON public.document_folders;
DROP POLICY IF EXISTS "Owner can update document_folders" ON public.document_folders;
DROP POLICY IF EXISTS "Owner can delete document_folders" ON public.document_folders;

CREATE POLICY "Members can view document_folders"
ON public.document_folders FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create document_folders"
ON public.document_folders FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update document_folders"
ON public.document_folders FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete document_folders"
ON public.document_folders FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- DOCUMENT_FILES
DROP POLICY IF EXISTS "Owner can view document_files" ON public.document_files;
DROP POLICY IF EXISTS "Owner can create document_files" ON public.document_files;
DROP POLICY IF EXISTS "Owner can update document_files" ON public.document_files;
DROP POLICY IF EXISTS "Owner can delete document_files" ON public.document_files;

CREATE POLICY "Members can view document_files"
ON public.document_files FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create document_files"
ON public.document_files FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update document_files"
ON public.document_files FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete document_files"
ON public.document_files FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- PROJECT_REFERENCES
DROP POLICY IF EXISTS "Owner can view project_references" ON public.project_references;
DROP POLICY IF EXISTS "Owner can create project_references" ON public.project_references;
DROP POLICY IF EXISTS "Owner can update project_references" ON public.project_references;
DROP POLICY IF EXISTS "Owner can delete project_references" ON public.project_references;

CREATE POLICY "Members can view project_references"
ON public.project_references FOR SELECT TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Owner/professional can create project_references"
ON public.project_references FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can update project_references"
ON public.project_references FOR UPDATE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

CREATE POLICY "Owner/professional can delete project_references"
ON public.project_references FOR DELETE TO authenticated
USING (public.get_project_role(project_id, auth.uid()) IN ('owner', 'professional'));

-- =============================================
-- 9. PROFILES: allow members to see each other
-- =============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles of project members"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    JOIN public.profiles p ON p.id = pm1.profile_id
    WHERE pm2.profile_id = profiles.id
    AND p.user_id = auth.uid()
  )
);

-- =============================================
-- 10. STORAGE BUCKET: project-covers
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-covers', 'project-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view project covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-covers');

CREATE POLICY "Authenticated users can upload project covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-covers');

CREATE POLICY "Users can update their own project covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
