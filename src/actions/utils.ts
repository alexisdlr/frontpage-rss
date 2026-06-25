import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { ActionError } from "@/src/types/actions";
import type { Database } from "@/src/types/database";
import { createClient } from "@/src/utils/supabase/server";

export type TypedSupabaseClient = SupabaseClient<Database>;

export async function getAuthenticatedClient(): Promise<
  { ok: true; supabase: TypedSupabaseClient; user: User } | ActionError
> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore) as TypedSupabaseClient;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, error: "You must be signed in." };
  }

  return { ok: true, supabase, user };
}

export function unauthorizedError(): ActionError {
  return { ok: false, error: "You must be signed in." };
}

export function validationError(message: string): ActionError {
  return { ok: false, error: message };
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const DEFAULT_PAGE_SIZE = 30;

export function mapFeedItemRow(
  row: DbFeedItemQueryRow,
): import("@/src/types/actions").FeedItemWithMeta {
  const feed = Array.isArray(row.feeds) ? row.feeds[0] : row.feeds;
  const state = Array.isArray(row.user_item_states)
    ? row.user_item_states[0]
    : row.user_item_states;
  const bookmarks = Array.isArray(row.bookmarks)
    ? row.bookmarks
    : row.bookmarks
      ? [row.bookmarks]
      : [];

  return {
    id: row.id,
    feedId: row.feed_id,
    guid: row.guid,
    url: row.url,
    title: row.title,
    description: row.description,
    contentHtml: row.content_html,
    author: row.author,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    isRead: state?.is_read ?? false,
    readAt: state?.read_at ?? null,
    isBookmarked: bookmarks.length > 0,
    feed: {
      id: feed?.id ?? row.feed_id,
      customTitle: feed?.custom_title ?? null,
      faviconUrl: feed?.favicon_url ?? null,
      siteUrl: feed?.site_url ?? null,
      categoryId: feed?.category_id ?? null,
      url: feed?.url ?? "",
    },
  };
}

/** Shape of a feed_items row returned by FEED_ITEM_SELECT (with nested joins). */
export type DbFeedItemQueryRow = {
  id: string;
  feed_id: string;
  guid: string;
  url: string;
  title: string | null;
  description: string | null;
  content_html: string | null;
  author: string | null;
  published_at: string | null;
  fetched_at: string;
  feeds:
    | {
        id: string;
        custom_title: string | null;
        favicon_url: string | null;
        site_url: string | null;
        category_id: string | null;
        url: string;
      }
    | {
        id: string;
        custom_title: string | null;
        favicon_url: string | null;
        site_url: string | null;
        category_id: string | null;
        url: string;
      }[]
    | null;
  user_item_states:
    | { is_read: boolean; read_at: string | null }
    | { is_read: boolean; read_at: string | null }[]
    | null;
  bookmarks?: { id: string } | { id: string }[] | null;
};

export const FEED_ITEM_SELECT = `
  id,
  feed_id,
  guid,
  url,
  title,
  description,
  content_html,
  author,
  published_at,
  fetched_at,
  feeds (
    id,
    custom_title,
    favicon_url,
    site_url,
    category_id,
    url
  ),
  user_item_states (
    is_read,
    read_at
  ),
  bookmarks (
    id
  )
`;
