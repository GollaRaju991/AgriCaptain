
-- Create sellers table
CREATE TABLE public.sellers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  seller_type text NOT NULL CHECK (seller_type IN ('agriculture_products', 'farmers_market')),
  name text NOT NULL,
  aadhaar_number text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  pincode text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own seller registration"
  ON public.sellers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own seller registration"
  ON public.sellers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller registration"
  ON public.sellers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for seller photos
INSERT INTO storage.buckets (id, name, public) VALUES ('seller-photos', 'seller-photos', true);

CREATE POLICY "Authenticated users can upload seller photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'seller-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view seller photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'seller-photos');

CREATE POLICY "Users can update their own seller photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'seller-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own seller photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'seller-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
