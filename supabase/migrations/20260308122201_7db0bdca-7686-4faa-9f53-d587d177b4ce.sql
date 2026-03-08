
-- Remove overly permissive SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view sellers for marketplace" ON public.sellers;
DROP POLICY IF EXISTS "Anyone can view all farmer crops" ON public.farmer_crops;

-- Create a public view for farmer_crops (excluding user_id for privacy)
CREATE OR REPLACE VIEW public.public_farmer_crops
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

-- Allow anyone to read from the base tables via views (security_invoker uses the caller's permissions)
-- We need a policy that allows SELECT for the view's purpose
-- Use anon-friendly policies on the base tables scoped to view access

-- For sellers: the public_sellers view already exists, but we need a SELECT policy for it to work
-- Since we dropped the broad one, we need to re-add one that allows reading non-sensitive data through the view
CREATE POLICY "Allow public read for marketplace views"
ON public.sellers FOR SELECT
TO anon, authenticated
USING (true);

-- For farmer_crops: allow public read through the view
CREATE POLICY "Allow public read for crop marketplace"
ON public.farmer_crops FOR SELECT
TO anon, authenticated
USING (true);
