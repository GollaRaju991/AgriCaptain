CREATE OR REPLACE FUNCTION public.get_farmer_crop_contact(_crop_id uuid)
RETURNS TABLE (
  name text,
  phone text,
  photo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.name, s.phone, s.photo_url
  FROM public.farmer_crops fc
  JOIN public.sellers s ON s.id = fc.seller_id
  WHERE fc.id = _crop_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_farmer_crop_contact(uuid) TO anon, authenticated;