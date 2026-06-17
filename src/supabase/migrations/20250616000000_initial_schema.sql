-- Frontpage initial schema: profiles, feeds, items, read state, bookmarks + RLS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.feed_health_status AS ENUM ('active', 'stale', 'error');

-- ---------------------------------------------------------------------------
-- Profiles & preferences (1:1 with auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  layout TEXT NOT NULL DEFAULT 'standard',
  refresh_interval INTEGER NOT NULL DEFAULT 30 CHECK (refresh_interval >= 5),
  category_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  default_layout TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Categories & feeds
-- ---------------------------------------------------------------------------

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE public.feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  custom_title TEXT,
  site_url TEXT,
  description TEXT,
  favicon_url TEXT,
  health_status public.feed_health_status NOT NULL DEFAULT 'active',
  last_fetch_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  etag TEXT,
  last_modified TEXT,
  fetch_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, url)
);

CREATE TABLE public.feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES public.feeds (id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content_html TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feed_id, guid)
);

-- ---------------------------------------------------------------------------
-- Per-user state
-- ---------------------------------------------------------------------------

CREATE TABLE public.user_item_states (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.feed_items (id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.feed_items (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

-- ---------------------------------------------------------------------------
-- Indexes (access patterns from technical requirements)
-- ---------------------------------------------------------------------------

CREATE INDEX idx_categories_user_id ON public.categories (user_id);
CREATE INDEX idx_categories_user_sort ON public.categories (user_id, sort_order);

CREATE INDEX idx_feeds_user_id ON public.feeds (user_id);
CREATE INDEX idx_feeds_category_id ON public.feeds (category_id);

CREATE INDEX idx_feed_items_feed_published ON public.feed_items (feed_id, published_at DESC);
CREATE INDEX idx_feed_items_published ON public.feed_items (published_at DESC);

CREATE INDEX idx_user_item_states_user_read ON public.user_item_states (user_id, is_read);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_item_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- user_preferences
CREATE POLICY "user_preferences_select_own" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own" ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own" ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- categories
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- feeds
CREATE POLICY "feeds_select_own" ON public.feeds
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "feeds_insert_own" ON public.feeds
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feeds_update_own" ON public.feeds
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feeds_delete_own" ON public.feeds
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- feed_items (accessible when parent feed belongs to user)
CREATE POLICY "feed_items_select_own" ON public.feed_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.feeds
      WHERE feeds.id = feed_items.feed_id
        AND feeds.user_id = auth.uid()
    )
  );

CREATE POLICY "feed_items_insert_own" ON public.feed_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.feeds
      WHERE feeds.id = feed_items.feed_id
        AND feeds.user_id = auth.uid()
    )
  );

CREATE POLICY "feed_items_update_own" ON public.feed_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.feeds
      WHERE feeds.id = feed_items.feed_id
        AND feeds.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.feeds
      WHERE feeds.id = feed_items.feed_id
        AND feeds.user_id = auth.uid()
    )
  );

CREATE POLICY "feed_items_delete_own" ON public.feed_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.feeds
      WHERE feeds.id = feed_items.feed_id
        AND feeds.user_id = auth.uid()
    )
  );

-- user_item_states
CREATE POLICY "user_item_states_select_own" ON public.user_item_states
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_item_states_insert_own" ON public.user_item_states
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_item_states_update_own" ON public.user_item_states
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_item_states_delete_own" ON public.user_item_states
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- bookmarks
CREATE POLICY "bookmarks_select_own" ON public.bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own" ON public.bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own" ON public.bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auth trigger: create profile + preferences on sign-up
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Keep preferences.updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
