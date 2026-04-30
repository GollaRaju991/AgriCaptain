-- =========================================
-- 1. seller_products: add review fields
-- =========================================
ALTER TABLE public.seller_products
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- Mark existing rows as approved so the live site keeps working
UPDATE public.seller_products SET review_status = 'approved' WHERE review_status = 'pending';

-- Tighten public read to approved only
DROP POLICY IF EXISTS "Public can view active products" ON public.seller_products;
CREATE POLICY "Public can view approved products"
  ON public.seller_products FOR SELECT
  TO public
  USING (status = 'active' AND review_status = 'approved');

-- Admin policies
CREATE POLICY "Admins can view all seller products"
  ON public.seller_products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all seller products"
  ON public.seller_products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete seller products"
  ON public.seller_products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 2. farmer_crops: add review fields + listing_type
-- =========================================
ALTER TABLE public.farmer_crops
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'sell_crop';

-- Backfill listing_type from existing sell_type/availability_location
UPDATE public.farmer_crops
  SET listing_type = CASE
    WHEN availability_location ILIKE '%farm%' OR sell_type ILIKE '%direct%' THEN 'direct_from_farm'
    ELSE 'sell_crop'
  END
  WHERE listing_type = 'sell_crop';

-- Mark existing crops approved so nothing disappears
UPDATE public.farmer_crops SET review_status = 'approved' WHERE review_status = 'pending';

-- Replace the public read policy with an approved-only filter
DROP POLICY IF EXISTS "Public marketplace read for crops" ON public.farmer_crops;
CREATE POLICY "Public can view approved crops"
  ON public.farmer_crops FOR SELECT
  TO anon, authenticated
  USING (review_status = 'approved');

-- Admin policies on farmer_crops
CREATE POLICY "Admins can view all crops"
  ON public.farmer_crops FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all crops"
  ON public.farmer_crops FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete crops"
  ON public.farmer_crops FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 3. Admin read access for related listings
-- =========================================
CREATE POLICY "Admins can view all farm worker listings"
  ON public.farm_worker_listings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update farm worker listings"
  ON public.farm_worker_listings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all driver listings"
  ON public.driver_listings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all vehicle listings"
  ON public.vehicle_listings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 4. Indexes for fast admin filtering
-- =========================================
CREATE INDEX IF NOT EXISTS idx_seller_products_review_status ON public.seller_products(review_status);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_review_status ON public.farmer_crops(review_status);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_listing_type ON public.farmer_crops(listing_type);