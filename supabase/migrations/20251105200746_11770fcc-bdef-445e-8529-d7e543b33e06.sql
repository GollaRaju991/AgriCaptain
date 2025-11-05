-- Fix function search path for security
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;