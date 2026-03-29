-- Fix: Restrict vendor_order_alerts INSERT to only allow alerts for orders owned by the inserting user
DROP POLICY IF EXISTS "System can insert alerts" ON public.vendor_order_alerts;

CREATE POLICY "Users can insert alerts for own orders"
ON public.vendor_order_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);