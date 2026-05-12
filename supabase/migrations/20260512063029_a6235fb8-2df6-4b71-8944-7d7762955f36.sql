
-- ===== farm_workers: lock down writes to admins, restrict reads to authenticated =====
DROP POLICY IF EXISTS "Authenticated users can insert farm workers" ON public.farm_workers;
DROP POLICY IF EXISTS "Authenticated users can update farm workers" ON public.farm_workers;
DROP POLICY IF EXISTS "Anyone can view active farm workers" ON public.farm_workers;

CREATE POLICY "Admins can insert farm workers"
  ON public.farm_workers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update farm workers"
  ON public.farm_workers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete farm workers"
  ON public.farm_workers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active farm workers"
  ON public.farm_workers FOR SELECT TO authenticated
  USING (is_active = true);

-- ===== farm_worker_listings: remove anon write/read, require authenticated reads =====
DROP POLICY IF EXISTS "Allow sync inserts" ON public.farm_worker_listings;
DROP POLICY IF EXISTS "Allow sync updates" ON public.farm_worker_listings;
DROP POLICY IF EXISTS "Public read workers" ON public.farm_worker_listings;

CREATE POLICY "Authenticated can read farm worker listings"
  ON public.farm_worker_listings FOR SELECT TO authenticated
  USING (true);

-- ===== driver_listings: remove anon write/read =====
DROP POLICY IF EXISTS "Allow sync inserts" ON public.driver_listings;
DROP POLICY IF EXISTS "Allow sync updates" ON public.driver_listings;
DROP POLICY IF EXISTS "Public read drivers" ON public.driver_listings;

CREATE POLICY "Authenticated can read driver listings"
  ON public.driver_listings FOR SELECT TO authenticated
  USING (true);

-- ===== vehicle_listings: remove anon write & restrict reads to authenticated =====
DROP POLICY IF EXISTS "Allow sync inserts" ON public.vehicle_listings;
DROP POLICY IF EXISTS "Allow sync updates" ON public.vehicle_listings;
DROP POLICY IF EXISTS "Public can view active vehicle listings" ON public.vehicle_listings;

CREATE POLICY "Authenticated can view active vehicle listings"
  ON public.vehicle_listings FOR SELECT TO authenticated
  USING (is_active = true);

-- ===== crop_views: restrict reads to owner =====
DROP POLICY IF EXISTS "Public can view crop views" ON public.crop_views;

CREATE POLICY "Users can view own crop views"
  ON public.crop_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ===== Realtime: remove unused addresses table from publication =====
ALTER PUBLICATION supabase_realtime DROP TABLE public.addresses;
