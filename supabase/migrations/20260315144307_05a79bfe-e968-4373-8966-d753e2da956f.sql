
-- Function to safely increment post views (bypasses strict RLS)
CREATE OR REPLACE FUNCTION public.increment_post_views(post_slug TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts SET views = views + 1 WHERE slug = post_slug AND is_published = true;
$$;
