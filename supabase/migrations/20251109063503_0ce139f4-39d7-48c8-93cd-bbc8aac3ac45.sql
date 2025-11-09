-- Create gift_cards table
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  initial_amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gift_card_transactions table for tracking all transactions
CREATE TABLE public.gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redeem', 'credit')),
  amount NUMERIC NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_cards
CREATE POLICY "Users can view their own gift cards"
ON public.gift_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gift cards"
ON public.gift_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift cards"
ON public.gift_cards
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for gift_card_transactions
CREATE POLICY "Users can view their own transactions"
ON public.gift_card_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.gift_card_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to generate unique gift card code
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

-- Create function to update gift card updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_gift_card_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_gift_card_updated_at();

-- Create indexes for performance
CREATE INDEX idx_gift_cards_user_id ON public.gift_cards(user_id);
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_card_transactions_gift_card_id ON public.gift_card_transactions(gift_card_id);
CREATE INDEX idx_gift_card_transactions_user_id ON public.gift_card_transactions(user_id);