-- Fix search_path for generate_gift_card_code function
DROP FUNCTION IF EXISTS public.generate_gift_card_code();

CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character code (format: XXXX-XXXX-XXXX-XXXX)
    new_code := upper(
      substr(md5(random()::text), 1, 4) || '-' ||
      substr(md5(random()::text), 1, 4) || '-' ||
      substr(md5(random()::text), 1, 4) || '-' ||
      substr(md5(random()::text), 1, 4)
    );
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;