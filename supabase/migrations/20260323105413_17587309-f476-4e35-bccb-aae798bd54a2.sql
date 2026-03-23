
-- Vendor details table
CREATE TABLE public.vendor_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  vendor_name text NOT NULL,
  license_number text,
  shop_address text,
  village text,
  mandal text,
  district text,
  state text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view vendor details" ON public.vendor_details FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert vendor details" ON public.vendor_details FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vendor details" ON public.vendor_details FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Product specifications table for detailed pesticide/agricultural info
CREATE TABLE public.product_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.seller_products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  target_pests text[],
  suitable_crops text[],
  active_ingredients text,
  dosage text,
  application_method text,
  frequency_of_use text,
  safety_instructions text,
  protective_equipment text,
  waiting_period text,
  storage_instructions text,
  expiry_date date,
  manufacturing_date date,
  package_size text,
  composition text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product specifications" ON public.product_specifications FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert specs" ON public.product_specifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own specs" ON public.product_specifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Vendor order alerts table
CREATE TABLE public.vendor_order_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES public.vendor_details(id),
  seller_id uuid REFERENCES public.sellers(id),
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  customer_address text,
  status text NOT NULL DEFAULT 'pending',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_order_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own alerts" ON public.vendor_order_alerts FOR SELECT TO authenticated USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "System can insert alerts" ON public.vendor_order_alerts FOR INSERT TO authenticated WITH CHECK (true);
