
-- Add new columns to sellers table
ALTER TABLE public.sellers 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS shop_farm_name text,
  ADD COLUMN IF NOT EXISTS seller_sub_type text DEFAULT 'farmer',
  ADD COLUMN IF NOT EXISTS pan_card_url text,
  ADD COLUMN IF NOT EXISTS aadhaar_document_url text,
  ADD COLUMN IF NOT EXISTS bank_account_holder text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS farm_location text,
  ADD COLUMN IF NOT EXISTS google_map_location text,
  ADD COLUMN IF NOT EXISTS shop_banner_url text;

-- Create seller_products table
CREATE TABLE IF NOT EXISTS public.seller_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  category text NOT NULL,
  sub_category text,
  brand text,
  product_type text,
  mrp_price numeric NOT NULL,
  selling_price numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  unit_type text NOT NULL DEFAULT '1 kg',
  description text,
  crop_type text,
  suitable_soil text,
  season text,
  shelf_life text,
  delivery_available boolean DEFAULT true,
  delivery_charge numeric DEFAULT 0,
  delivery_days text,
  product_images text[] DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_products
CREATE POLICY "Public can view active products" ON public.seller_products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can insert own products" ON public.seller_products
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update own products" ON public.seller_products
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Sellers can delete own products" ON public.seller_products
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view own products" ON public.seller_products
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Create storage bucket for seller documents
INSERT INTO storage.buckets (id, name, public) VALUES ('seller-documents', 'seller-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for seller-documents bucket
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'seller-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'seller-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create storage bucket for product images  
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
