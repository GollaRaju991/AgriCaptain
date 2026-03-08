ALTER TABLE public.farmer_crops ADD COLUMN sell_type text NOT NULL DEFAULT 'both';

-- Update the public view to include sell_type
DROP VIEW IF EXISTS public.public_farmer_crops;
CREATE VIEW public.public_farmer_crops AS
SELECT id, seller_id, crop_name, quantity, price, harvest_date, quality_grade,
       availability_location, location_address, crop_images, created_at, sell_type
FROM public.farmer_crops;