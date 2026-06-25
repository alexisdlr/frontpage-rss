"use server";

import {
  DEFAULT_PAGE_SIZE,
  FEED_ITEM_SELECT,
  getAuthenticatedClient,
  mapFeedItemRow,
  validationError,
  type TypedSupabaseClient,
} from "@/src/actions/utils";
import { getFeedIdsForScope } from "@/src/lib/db/readState";

import type {
  ActionResult,
  FeedItemWithMeta,
  ItemCursor,
  ItemListScope,
  PaginatedResult,
} from "@/src/types/actions";

type FeedItemQueryRow = Parameters<typeof mapFeedItemRow>[0];

async function buildScopedFeedIds(
  supabase: TypedSupabaseClient,
  userId: string,
  scope: ItemListScope,
): Promise<string[] | null> {
  if (scope.type === "feed") {
    const feedIds = await getFeedIdsForScope(supabase, userId, scope);
    return feedIds.length > 0 ? feedIds : [];
  }

  if (scope.type === "category") {
    const feedIds = await getFeedIdsForScope(supabase, userId, scope);
    return feedIds.length > 0 ? feedIds : [];
  }

  if (scope.type === "uncategorized") {
    const feedIds = await getFeedIdsForScope(supabase, userId, scope);
    return feedIds.length > 0 ? feedIds : [];
  }

  return null;
}

export async function getFeedItems(input: {
  scope?: ItemListScope;
  cursor?: ItemCursor;
  limit?: number;
}): Promise<ActionResult<PaginatedResult<FeedItemWithMeta>>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;
  const scope = input.scope ?? { type: "all" };
  const limit = input.limit ?? DEFAULT_PAGE_SIZE;
  const feedIds = await buildScopedFeedIds(supabase, user.id, scope);

  if (feedIds !== null && feedIds.length === 0) {
    return {
      ok: true,
      data: {
        items: [],
        nextCursor: null,
        hasMore: false,
      },
    };
  }

  let query = supabase
    .from("feed_items")
    .select(FEED_ITEM_SELECT)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (feedIds !== null) {
    query = query.in("feed_id", feedIds);
  } else {
    const { data: ownedFeeds, error: feedsError } = await supabase
      .from("feeds")
      .select("id")
      .eq("user_id", user.id);

    if (feedsError) {
      return { ok: false, error: feedsError.message };
    }

    const ownedFeedIds = (ownedFeeds ?? []).map((feed) => feed.id);
    if (ownedFeedIds.length === 0) {
      return {
        ok: true,
        data: { items: [], nextCursor: null, hasMore: false },
      };
    }

    query = query.in("feed_id", ownedFeedIds);
  }

  if (input.cursor) {
    query = query.or(
      `published_at.lt.${input.cursor.publishedAt},and(published_at.eq.${input.cursor.publishedAt},id.lt.${input.cursor.id})`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as FeedItemQueryRow[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const items = pageRows.map(mapFeedItemRow);

  const lastItem = pageRows.at(-1);
  const nextCursor =
    hasMore && lastItem?.published_at
      ? { publishedAt: lastItem.published_at, id: lastItem.id }
      : hasMore && lastItem
        ? { publishedAt: "1970-01-01T00:00:00.000Z", id: lastItem.id }
        : null;

  return {
    ok: true,
    data: {
      items,
      nextCursor,
      hasMore,
    },
  };
}

export async function getFeedItem(
  itemId: string,
): Promise<ActionResult<FeedItemWithMeta>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase } = auth;

  const { data, error } = await supabase
    .from("feed_items")
    .select(FEED_ITEM_SELECT)
    .eq("id", itemId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return validationError("Item not found.");
  }

  return { ok: true, data: mapFeedItemRow(data as FeedItemQueryRow) };
}

export async function getAdjacentFeedItems(
  itemId: string,
  scope?: ItemListScope,
): Promise<
  ActionResult<{
    previous: FeedItemWithMeta | null;
    next: FeedItemWithMeta | null;
  }>
> {
  const currentResult = await getFeedItem(itemId);
  if (!currentResult.ok) {
    return currentResult;
  }

  const current = currentResult.data;
  const listScope = scope ?? { type: "all" as const };

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;
  const feedIds = await buildScopedFeedIds(supabase, user.id, listScope);

  if (feedIds !== null && feedIds.length === 0) {
    return { ok: true, data: { previous: null, next: null } };
  }

  const publishedAt = current.publishedAt ?? "1970-01-01T00:00:00.000Z";

  let previousQuery = supabase
    .from("feed_items")
    .select(FEED_ITEM_SELECT)
    .or(
      `published_at.gt.${publishedAt},and(published_at.eq.${publishedAt},id.gt.${current.id})`,
    )
    .order("published_at", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(1);

  let nextQuery = supabase
    .from("feed_items")
    .select(FEED_ITEM_SELECT)
    .or(
      `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},id.lt.${current.id})`,
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(1);

  if (feedIds !== null) {
    previousQuery = previousQuery.in("feed_id", feedIds);
    nextQuery = nextQuery.in("feed_id", feedIds);
  } else {
    const { data: ownedFeeds } = await supabase
      .from("feeds")
      .select("id")
      .eq("user_id", user.id);

    const ownedFeedIds = (ownedFeeds ?? []).map((feed) => feed.id);
    previousQuery = previousQuery.in("feed_id", ownedFeedIds);
    nextQuery = nextQuery.in("feed_id", ownedFeedIds);
  }

  const [{ data: previousRow }, { data: nextRow }] = await Promise.all([
    previousQuery.maybeSingle(),
    nextQuery.maybeSingle(),
  ]);

  return {
    ok: true,
    data: {
      previous: previousRow
        ? mapFeedItemRow(previousRow as FeedItemQueryRow)
        : null,
      next: nextRow ? mapFeedItemRow(nextRow as FeedItemQueryRow) : null,
    },
  };
}

export async function getFeedItemCounts(input?: {
  scope?: ItemListScope;
}): Promise<ActionResult<{ total: number }>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;
  const scope = input?.scope ?? { type: "all" };
  const feedIds = await buildScopedFeedIds(supabase, user.id, scope);

  if (feedIds !== null && feedIds.length === 0) {
    return { ok: true, data: { total: 0 } };
  }

  let query = supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true });

  if (feedIds !== null) {
    query = query.in("feed_id", feedIds);
  } else {
    const { data: ownedFeeds, error: feedsError } = await supabase
      .from("feeds")
      .select("id")
      .eq("user_id", user.id);

    if (feedsError) {
      return { ok: false, error: feedsError.message };
    }

    const ownedFeedIds = (ownedFeeds ?? []).map((feed) => feed.id);
    if (ownedFeedIds.length === 0) {
      return { ok: true, data: { total: 0 } };
    }

    query = query.in("feed_id", ownedFeedIds);
  }

  const { count, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { total: count ?? 0 } };
}
export async function searchFeedItems(
  query: string,
  limit: number = 10,
): Promise<ActionResult<FeedItemWithMeta[]>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  if (!query.trim()) {
    return {
      ok: true,
      data: [] as FeedItemWithMeta[],
    };
  }
  const term = query.toLowerCase().trim();

  const { data: ownedFeeds, error: feedsError } = await supabase
    .from("feeds")
    .select("id")
    .eq("user_id", user.id);

  if (feedsError) {
    return { ok: false, error: feedsError.message };
  }

  const ownedFeedIds = (ownedFeeds ?? []).map((feed) => feed.id);
  if (ownedFeedIds.length === 0) {
    return {
      ok: true,
      data: [] as FeedItemWithMeta[],
    };
  }

  let searchQuery = supabase
    .from("feed_items")
    .select(FEED_ITEM_SELECT)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)

    .limit(limit);

  searchQuery = searchQuery.in("feed_id", ownedFeedIds);

  const { data: feedItems, error } = await searchQuery;

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: feedItems.map(mapFeedItemRow) };
}
