
-- Add village, district, state columns to sellers table
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS village text;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS state text;

-- Create farmer_crops table
CREATE TABLE public.farmer_crops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  crop_name text NOT NULL,
  quantity text NOT NULL,
  price text NOT NULL,
  harvest_date date,
  quality_grade text NOT NULL DEFAULT 'Grade A',
  availability_location text NOT NULL DEFAULT 'Marketplace',
  location_address text,
  crop_images text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;

-- RLS policies for farmer_crops
CREATE POLICY "Users can insert their own crops" ON public.farmer_crops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own crops" ON public.farmer_crops FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own crops" ON public.farmer_crops FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for crop-images bucket
CREATE POLICY "Users can upload crop images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view crop images" ON storage.objects FOR SELECT USING (bucket_id = 'crop-images');
