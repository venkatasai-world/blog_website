
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- CATEGORIES TABLE
-- ===========================
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- ===========================
-- USER ROLES TABLE (must be created before posts RLS references it)
-- ===========================
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Now add admin policies to categories
CREATE POLICY "Only admin can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admin can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admin can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- ===========================
-- POSTS TABLE
-- ===========================
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  featured_image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author TEXT NOT NULL DEFAULT 'VenkataSai Merugu',
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are publicly readable" ON public.posts FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Only admin can insert posts" ON public.posts FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin or view increment can update posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Only admin can delete posts" ON public.posts FOR DELETE USING (public.is_admin());

-- ===========================
-- NAV ITEMS TABLE
-- ===========================
CREATE TABLE public.nav_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nav items are publicly readable" ON public.nav_items FOR SELECT USING (true);
CREATE POLICY "Only admin can insert nav items" ON public.nav_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admin can update nav items" ON public.nav_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admin can delete nav items" ON public.nav_items FOR DELETE USING (public.is_admin());

-- ===========================
-- COMMENTS TABLE
-- ===========================
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admin can delete comments" ON public.comments FOR DELETE USING (public.is_admin());

-- ===========================
-- CONTACT MESSAGES TABLE
-- ===========================
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admin can read contact messages" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Only admin can update contact messages" ON public.contact_messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admin can delete contact messages" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- ===========================
-- AUTO UPDATED_AT TRIGGER
-- ===========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================
-- STORAGE BUCKET FOR IMAGES
-- ===========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

CREATE POLICY "Blog images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admin can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());
CREATE POLICY "Admin can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND public.is_admin());

-- ===========================
-- SEED: DEFAULT NAV ITEMS
-- ===========================
INSERT INTO public.nav_items (label, href, "order", is_active) VALUES
  ('Home', '/', 1, true),
  ('Blog', '/blog', 2, true),
  ('AI', '/category/artificial-intelligence', 3, true),
  ('Programming', '/category/programming', 4, true),
  ('Movies', '/category/movies', 5, true),
  ('Projects', '/category/projects', 6, true),
  ('Thoughts', '/category/thoughts', 7, true),
  ('About', '/about', 8, true),
  ('Contact', '/contact', 9, true);

-- ===========================
-- SEED: DEFAULT CATEGORIES
-- ===========================
INSERT INTO public.categories (name, slug, description) VALUES
  ('Artificial Intelligence', 'artificial-intelligence', 'Posts about AI, machine learning, and deep learning'),
  ('Machine Learning', 'machine-learning', 'Tutorials and insights on machine learning'),
  ('Programming', 'programming', 'Coding tutorials and software development'),
  ('Movies', 'movies', 'Movie reviews and analysis'),
  ('Web Development', 'web-development', 'Frontend and backend web development'),
  ('Technology', 'technology', 'General technology news and insights'),
  ('Projects', 'projects', 'Personal and open-source projects'),
  ('Career', 'career', 'Career advice and professional growth'),
  ('Thoughts', 'thoughts', 'Personal thoughts and reflections');
