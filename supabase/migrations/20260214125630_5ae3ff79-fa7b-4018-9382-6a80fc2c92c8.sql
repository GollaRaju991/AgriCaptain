
-- Create saved_upi table
CREATE TABLE public.saved_upi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upi_id TEXT NOT NULL,
  provider TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_upi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own UPI" ON public.saved_upi FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own UPI" ON public.saved_upi FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own UPI" ON public.saved_upi FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own UPI" ON public.saved_upi FOR DELETE USING (auth.uid() = user_id);

-- Create saved_cards table
CREATE TABLE public.saved_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_number_last4 TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'debit',
  bank_name TEXT,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards" ON public.saved_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.saved_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.saved_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.saved_cards FOR DELETE USING (auth.uid() = user_id);
