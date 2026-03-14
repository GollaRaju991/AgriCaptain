
-- Delivery tracking table - stores shipment/delivery events for each order
CREATE TABLE public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  courier_name TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  out_for_delivery_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_notes TEXT,
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Return requests table - stores return/refund requests
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Not satisfied',
  status TEXT NOT NULL DEFAULT 'approved',
  refund_amount NUMERIC NOT NULL DEFAULT 0,
  refund_status TEXT NOT NULL DEFAULT 'processing',
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  refund_completed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- RLS for delivery_tracking: users can view their own
CREATE POLICY "Users can view their own delivery tracking"
  ON public.delivery_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery tracking"
  ON public.delivery_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery tracking"
  ON public.delivery_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS for return_requests: users can view/create their own
CREATE POLICY "Users can view their own return requests"
  ON public.return_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own return requests"
  ON public.return_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own return requests"
  ON public.return_requests FOR UPDATE
  USING (auth.uid() = user_id);
