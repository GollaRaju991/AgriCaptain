-- Fix search_path for update_gift_card_updated_at function
DROP TRIGGER IF EXISTS update_gift_cards_updated_at ON public.gift_cards;
DROP FUNCTION IF EXISTS public.update_gift_card_updated_at();

CREATE OR REPLACE FUNCTION public.update_gift_card_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_gift_card_updated_at();