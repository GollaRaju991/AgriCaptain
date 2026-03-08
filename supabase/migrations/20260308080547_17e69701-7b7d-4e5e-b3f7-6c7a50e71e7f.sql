
-- Allow users to delete their own crops
CREATE POLICY "Users can delete their own crops"
ON public.farmer_crops
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own seller registration
CREATE POLICY "Users can delete their own seller registration"
ON public.sellers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
