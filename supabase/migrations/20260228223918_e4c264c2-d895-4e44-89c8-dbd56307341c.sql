-- 1) Helper SECURITY DEFINER para evitar recursão em política de profiles
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.profiles target
      WHERE target.id = _profile_id
        AND target.user_id = _user_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members pm_target
      JOIN public.project_members pm_me
        ON pm_me.project_id = pm_target.project_id
      JOIN public.profiles me
        ON me.id = pm_me.profile_id
      WHERE pm_target.profile_id = _profile_id
        AND me.user_id = _user_id
    );
$$;

-- 2) Recriar policy de SELECT de profiles sem auto-referência recursiva
DROP POLICY IF EXISTS "Users can view profiles of project members" ON public.profiles;
CREATE POLICY "Users can view profiles of project members"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_view_profile(id, auth.uid()));

-- 3) Garantir que owner veja o próprio projeto imediatamente após criar
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
CREATE POLICY "Members can view projects"
ON public.projects
FOR SELECT
TO authenticated
USING ((owner_id = auth.uid()) OR public.is_project_member(id, auth.uid()));

-- 4) Garantir trigger de auto-vínculo do owner em project_members
DROP TRIGGER IF EXISTS auto_create_project_member_trigger ON public.projects;
CREATE TRIGGER auto_create_project_member_trigger
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_project_member();