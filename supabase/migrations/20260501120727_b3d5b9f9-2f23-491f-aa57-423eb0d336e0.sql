CREATE OR REPLACE FUNCTION public.get_farm_worker_contact(_listing_id uuid)
RETURNS TABLE(name text, phone text, photo_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(fwl.worker_name, fw.name, 'Worker') AS name,
    COALESCE(
      NULLIF(NULLIF(fwl.phone, 'HIDDEN'), ''),
      fw.phone
    ) AS phone,
    COALESCE(fwl.profile_photo_url, fw.photo_url) AS photo_url
  FROM public.farm_worker_listings fwl
  LEFT JOIN public.farm_workers fw
    ON fw.id = fwl.source_id OR fw.id = fwl.id
  WHERE fwl.id = _listing_id
  LIMIT 1;
$$;