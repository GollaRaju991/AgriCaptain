
CREATE TABLE public.crop_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (crop_id, user_id)
);

CREATE TABLE public.crop_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (crop_id, user_id)
);

CREATE INDEX idx_crop_views_crop ON public.crop_views(crop_id);
CREATE INDEX idx_crop_likes_crop ON public.crop_likes(crop_id);

ALTER TABLE public.crop_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_likes ENABLE ROW LEVEL SECURITY;

-- Public can read counts
CREATE POLICY "Public can view crop views" ON public.crop_views FOR SELECT USING (true);
CREATE POLICY "Public can view crop likes" ON public.crop_likes FOR SELECT USING (true);

-- Authenticated users insert their own
CREATE POLICY "Users insert own view" ON public.crop_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own like" ON public.crop_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can remove own like (toggle off)
CREATE POLICY "Users delete own like" ON public.crop_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
