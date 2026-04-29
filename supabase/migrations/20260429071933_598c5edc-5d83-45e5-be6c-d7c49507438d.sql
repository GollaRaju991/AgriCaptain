CREATE TABLE public.crop_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'User',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_crop_comments_crop_id ON public.crop_comments(crop_id);
CREATE INDEX idx_crop_comments_created_at ON public.crop_comments(created_at DESC);

ALTER TABLE public.crop_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crop comments"
  ON public.crop_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own comments"
  ON public.crop_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.crop_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.crop_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_crop_comments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_crop_comments_updated_at
  BEFORE UPDATE ON public.crop_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_crop_comments_updated_at();