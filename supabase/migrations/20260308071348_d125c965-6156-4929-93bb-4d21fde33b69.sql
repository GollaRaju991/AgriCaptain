
-- Allow all authenticated users to view farmer crops (for Sell Crop listing)
CREATE POLICY "Anyone can view all farmer crops"
ON public.farmer_crops FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to view seller profiles (for farmer name/phone)
CREATE POLICY "Anyone can view all sellers"
ON public.sellers FOR SELECT
TO authenticated
USING (true);
