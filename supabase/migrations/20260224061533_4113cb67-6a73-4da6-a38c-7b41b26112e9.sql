
-- Add rate limiting columns to otp_verifications
ALTER TABLE public.otp_verifications 
  ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS send_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_sent_at timestamptz DEFAULT now();

-- Drop overly permissive referral read policy
DROP POLICY IF EXISTS "Anyone can read referral by code" ON public.referrals;

-- Create a security definer function for referral code validation
CREATE OR REPLACE FUNCTION public.validate_referral_code(code TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.referrals 
    WHERE referral_code = code 
      AND status = 'pending' 
      AND referred_user_id IS NULL
  );
$$;

-- Create a DB function for order number generation
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  num_exists BOOLEAN;
BEGIN
  LOOP
    new_number := '#AG' || upper(substr(md5(gen_random_uuid()::text || now()::text), 1, 9));
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_number) INTO num_exists;
    EXIT WHEN NOT num_exists;
  END LOOP;
  RETURN new_number;
END;
$$;
