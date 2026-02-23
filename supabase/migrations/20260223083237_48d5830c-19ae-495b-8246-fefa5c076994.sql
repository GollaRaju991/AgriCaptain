
-- Fix the overly permissive update policy on referrals
-- Drop and recreate with a more restrictive policy
DROP POLICY "System can update referrals" ON public.referrals;

-- Only allow the referrer to update their own referrals
CREATE POLICY "Users can update their own referrals" ON public.referrals 
FOR UPDATE USING (auth.uid() = referrer_id);
