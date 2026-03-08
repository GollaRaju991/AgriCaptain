
-- Drop the broad policies we just created (they defeat the purpose)
DROP POLICY IF EXISTS "Allow public read for marketplace views" ON public.sellers;
DROP POLICY IF EXISTS "Allow public read for crop marketplace" ON public.farmer_crops;

-- Recreate the public_farmer_crops view WITHOUT security_invoker 
-- so it runs as the view owner (postgres) and can read base tables
DROP VIEW IF EXISTS public.public_farmer_crops;
CREATE VIEW public.public_farmer_crops AS
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

-- Recreate public_sellers view WITHOUT security_invoker (it currently may have it)
DROP VIEW IF EXISTS public.public_sellers;
CREATE VIEW public.public_sellers AS
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
-- Note: aadhaar_number is excluded for privacy

-- Grant SELECT on the views to anon and authenticated
GRANT SELECT ON public.public_farmer_crops TO anon, authenticated;
GRANT SELECT ON public.public_sellers TO anon, authenticated;
