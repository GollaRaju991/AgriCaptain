
-- 1. Create a public_sellers view that excludes sensitive Aadhaar data
CREATE OR REPLACE VIEW public.public_sellers AS
SELECT id, user_id, name, phone, seller_type, address, village, district, state, status, photo_url, pincode, created_at, updated_at
FROM public.sellers;

-- 2. Drop the overly permissive "Anyone can view all sellers" policy
DROP POLICY IF EXISTS "Anyone can view all sellers" ON public.sellers;

-- 3. Create a narrower policy: authenticated users can only view non-sensitive seller info via the view
-- Keep the existing "Users can view their own seller registration" policy for full access to own data

-- 4. Remove client-side wallet update capability - revoke direct UPDATE on wallets
-- Drop the permissive update policy
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

-- 5. Remove client-side wallet_transactions insert capability  
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.wallet_transactions;
