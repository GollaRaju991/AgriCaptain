
CREATE OR REPLACE FUNCTION public.get_farm_worker_contact(_listing_id uuid)
RETURNS TABLE(name text, phone text, photo_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(fw.name, fwl.worker_name, 'Worker') AS name,
    COALESCE(fw.phone, fwl_raw.phone) AS phone,
    COALESCE(fw.photo_url, fwl.profile_photo_url) AS photo_url
  FROM public.farm_worker_listings fwl
  LEFT JOIN public.farm_workers fw
    ON fw.id = fwl.source_id OR fw.id = fwl.id
  LEFT JOIN LATERAL (
    -- Bypass any view-level masking by reading the underlying source row directly.
    SELECT phone FROM public.farm_workers WHERE id = fwl.source_id
    UNION ALL
    SELECT phone FROM public.farm_workers WHERE id = fwl.id
    LIMIT 1
  ) fwl_raw ON true
  WHERE fwl.id = _listing_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_farm_worker_contact(uuid) TO anon, authenticated;
