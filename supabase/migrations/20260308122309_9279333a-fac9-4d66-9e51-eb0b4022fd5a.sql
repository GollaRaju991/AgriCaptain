
-- Fix: Use security_invoker views but add targeted SELECT policies for marketplace access
DROP VIEW IF EXISTS public.public_farmer_crops;
CREATE VIEW public.public_farmer_crops
WITH (security_invoker = on) AS
SELECT
  fc.id,
  fc.crop_name,
  fc.quantity,
  fc.price,
  fc.crop_images,
  fc.harvest_date,
  fc.quality_grade,
  fc.availability_location,
  fc.location_address,
  fc.seller_id,
  fc.created_at
FROM public.farmer_crops fc;

DROP VIEW IF EXISTS public.public_sellers;
CREATE VIEW public.public_sellers
WITH (security_invoker = on) AS
SELECT
  s.id,
  s.name,
  s.phone,
  s.photo_url,
  s.address,
  s.pincode,
  s.village,
  s.district,
  s.state,
  s.seller_type,
  s.status,
  s.user_id,
  s.created_at,
  s.updated_at
FROM public.sellers s;

-- Now add back SELECT policies so the security_invoker views can read data
-- These are needed for the marketplace to function
CREATE POLICY "Public marketplace read for sellers"
ON public.sellers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public marketplace read for crops"
ON public.farmer_crops FOR SELECT
TO anon, authenticated
USING (true);
