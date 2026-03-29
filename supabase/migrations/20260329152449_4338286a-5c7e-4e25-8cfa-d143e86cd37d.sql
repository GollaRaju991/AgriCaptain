
-- 1. Fix sellers: Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public marketplace read for sellers" ON public.sellers;

-- 2. Fix vendor_details: Replace public SELECT with owner-only
DROP POLICY IF EXISTS "Public can view vendor details" ON public.vendor_details;
CREATE POLICY "Users can view own vendor details" ON public.vendor_details FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Fix security definer views - recreate with security_invoker
DROP VIEW IF EXISTS public.public_sellers;
CREATE VIEW public.public_sellers WITH (security_invoker=on) AS
  SELECT id, name, phone, photo_url, address, pincode, village, district, state, seller_type, status, user_id, created_at, updated_at
  FROM public.sellers;

DROP VIEW IF EXISTS public.public_farmer_crops;
CREATE VIEW public.public_farmer_crops WITH (security_invoker=on) AS
  SELECT id, seller_id, crop_name, quantity, price, harvest_date, quality_grade, availability_location, location_address, crop_images, created_at, sell_type, latitude, longitude
  FROM public.farmer_crops;

-- Grant access on views
GRANT SELECT ON public.public_sellers TO anon, authenticated;
GRANT SELECT ON public.public_farmer_crops TO anon, authenticated;
