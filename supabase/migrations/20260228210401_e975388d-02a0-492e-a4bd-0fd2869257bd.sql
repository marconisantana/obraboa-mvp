
-- =============================================
-- Purchase Orders & Dossiers tables
-- =============================================

-- 1. purchase_orders
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  order_number text NOT NULL,
  supplier_name text NOT NULL,
  supplier_contact text DEFAULT '',
  observations text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view purchase_orders" ON public.purchase_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = purchase_orders.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create purchase_orders" ON public.purchase_orders FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = purchase_orders.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update purchase_orders" ON public.purchase_orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = purchase_orders.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete purchase_orders" ON public.purchase_orders FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = purchase_orders.project_id AND projects.owner_id = auth.uid()));

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. purchase_order_items
CREATE TABLE public.purchase_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'un',
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view purchase_order_items" ON public.purchase_order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create purchase_order_items" ON public.purchase_order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update purchase_order_items" ON public.purchase_order_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete purchase_order_items" ON public.purchase_order_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM purchase_orders JOIN projects ON projects.id = purchase_orders.project_id WHERE purchase_orders.id = purchase_order_items.order_id AND projects.owner_id = auth.uid()));

-- 3. dossiers
CREATE TABLE public.dossiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  supplier_name text DEFAULT '',
  agreed_value numeric(12,2) NOT NULL DEFAULT 0,
  additive_value numeric(12,2) NOT NULL DEFAULT 0,
  observations text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view dossiers" ON public.dossiers FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = dossiers.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create dossiers" ON public.dossiers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = dossiers.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update dossiers" ON public.dossiers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = dossiers.project_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete dossiers" ON public.dossiers FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = dossiers.project_id AND projects.owner_id = auth.uid()));

CREATE TRIGGER update_dossiers_updated_at
  BEFORE UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. dossier_payments
CREATE TABLE public.dossier_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date date,
  receipt_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dossier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view dossier_payments" ON public.dossier_payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can create dossier_payments" ON public.dossier_payments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can update dossier_payments" ON public.dossier_payments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND projects.owner_id = auth.uid()));
CREATE POLICY "Owner can delete dossier_payments" ON public.dossier_payments FOR DELETE
  USING (EXISTS (SELECT 1 FROM dossiers JOIN projects ON projects.id = dossiers.project_id WHERE dossiers.id = dossier_payments.dossier_id AND projects.owner_id = auth.uid()));

-- 5. Storage bucket for dossier receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('dossier-receipts', 'dossier-receipts', true);

CREATE POLICY "Owner can upload dossier receipts" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dossier-receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view dossier receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'dossier-receipts');
CREATE POLICY "Owner can delete dossier receipts" ON storage.objects FOR DELETE
  USING (bucket_id = 'dossier-receipts' AND auth.role() = 'authenticated');
