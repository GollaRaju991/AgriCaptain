
-- Vehicle listings table for Agrizin partner vehicles
CREATE TABLE public.vehicle_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_name TEXT,
  model_year TEXT,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'Good',
  availability TEXT NOT NULL DEFAULT 'Available',
  -- Location fields
  country TEXT,
  state TEXT,
  district TEXT,
  mandal TEXT,
  village TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_address TEXT,
  -- Metadata
  vehicle_images TEXT[] DEFAULT '{}'::TEXT[],
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active vehicle listings
CREATE POLICY "Public can view active vehicle listings"
  ON public.vehicle_listings
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Authenticated users can insert their own listings
CREATE POLICY "Users can insert own vehicle listings"
  ON public.vehicle_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own vehicle listings"
  ON public.vehicle_listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own vehicle listings"
  ON public.vehicle_listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
