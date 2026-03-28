
-- Add latitude and longitude columns to farmer_crops
ALTER TABLE public.farmer_crops 
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Recreate the public_farmer_crops view to include lat/lon
CREATE OR REPLACE VIEW public.public_farmer_crops AS
SELECT 
  id,
  seller_id,
  crop_name,
  quantity,
  price,
  harvest_date,
  quality_grade,
  availability_location,
  location_address,
  crop_images,
  created_at,
  sell_type,
  latitude,
  longitude
FROM farmer_crops;
