DROP VIEW IF EXISTS public.public_farmer_crops;
CREATE VIEW public.public_farmer_crops
WITH (security_invoker = true)
AS
SELECT id, seller_id, crop_name, quantity, price, harvest_date, quality_grade,
       availability_location, location_address, crop_images, created_at,
       sell_type, latitude, longitude, review_status
FROM public.farmer_crops
WHERE review_status = 'approved';
GRANT SELECT ON public.public_farmer_crops TO anon, authenticated;