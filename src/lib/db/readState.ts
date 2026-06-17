import type { TypedSupabaseClient } from "@/src/actions/utils";
import type { UnreadCounts } from "@/src/types/actions";

export async function computeUnreadCounts(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<UnreadCounts> {
  const { data: feeds, error: feedsError } = await supabase
    .from("feeds")
    .select("id, category_id")
    .eq("user_id", userId);

  if (feedsError || !feeds?.length) {
    return {
      total: 0,
      uncategorized: 0,
      byFeed: {},
      byCategory: {},
    };
  }

  const feedIds = feeds.map((feed) => feed.id);
  const feedCategoryMap = new Map(
    feeds.map((feed) => [feed.id, feed.category_id]),
  );

  const { data: readStates, error: readError } = await supabase
    .from("user_item_states")
    .select("item_id")
    .eq("user_id", userId)
    .eq("is_read", true);

  if (readError) {
    return {
      total: 0,
      uncategorized: 0,
      byFeed: {},
      byCategory: {},
    };
  }

  const readItemIds = new Set((readStates ?? []).map((state) => state.item_id));

  const byFeed: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let uncategorized = 0;
  let total = 0;

  const batchSize = 20;
  for (let index = 0; index < feedIds.length; index += batchSize) {
    const batchFeedIds = feedIds.slice(index, index + batchSize);

    const { data: items, error: itemsError } = await supabase
      .from("feed_items")
      .select("id, feed_id")
      .in("feed_id", batchFeedIds);

    if (itemsError || !items) {
      continue;
    }

    for (const item of items) {
      if (readItemIds.has(item.id)) {
        continue;
      }

      total += 1;
      byFeed[item.feed_id] = (byFeed[item.feed_id] ?? 0) + 1;

      const categoryId = feedCategoryMap.get(item.feed_id);
      if (categoryId) {
        byCategory[categoryId] = (byCategory[categoryId] ?? 0) + 1;
      } else {
        uncategorized += 1;
      }
    }
  }

  return {
    total,
    uncategorized,
    byFeed,
    byCategory,
  };
}

export async function getUnreadItemIdsForFeeds(
  supabase: TypedSupabaseClient,
  userId: string,
  feedIds: string[],
): Promise<string[]> {
  if (feedIds.length === 0) {
    return [];
  }

  const { data: readStates } = await supabase
    .from("user_item_states")
    .select("item_id")
    .eq("user_id", userId)
    .eq("is_read", true);

  const readItemIds = new Set((readStates ?? []).map((state) => state.item_id));

  const { data: items, error } = await supabase
    .from("feed_items")
    .select("id")
    .in("feed_id", feedIds);

  if (error || !items) {
    return [];
  }

  return items
    .filter((item) => !readItemIds.has(item.id))
    .map((item) => item.id);
}

export async function getFeedIdsForScope(
  supabase: TypedSupabaseClient,
  userId: string,
  scope:
    | { type: "all" }
    | { type: "feed"; feedId: string }
    | { type: "category"; categoryId: string }
    | { type: "uncategorized" },
): Promise<string[]> {
  if (scope.type === "feed") {
    const { data: feed } = await supabase
      .from("feeds")
      .select("id")
      .eq("id", scope.feedId)
      .eq("user_id", userId)
      .maybeSingle();

    return feed ? [feed.id] : [];
  }

  let query = supabase.from("feeds").select("id").eq("user_id", userId);

  if (scope.type === "category") {
    query = query.eq("category_id", scope.categoryId);
  } else if (scope.type === "uncategorized") {
    query = query.is("category_id", null);
  }

  const { data: feeds, error } = await query;

  if (error || !feeds) {
    return [];
  }

  return feeds.map((feed) => feed.id);
}

export async function upsertReadStateForItems(
  supabase: TypedSupabaseClient,
  userId: string,
  itemIds: string[],
  isRead: boolean,
): Promise<{ error?: string }> {
  if (itemIds.length === 0) {
    return {};
  }

  const readAt = isRead ? new Date().toISOString() : null;
  const batchSize = 500;

  for (let index = 0; index < itemIds.length; index += batchSize) {
    const batch = itemIds.slice(index, index + batchSize).map((itemId) => ({
      user_id: userId,
      item_id: itemId,
      is_read: isRead,
      read_at: readAt,
    }));

    const { error } = await supabase.from("user_item_states").upsert(batch, {
      onConflict: "user_id,item_id",
    });

    if (error) {
      return { error: error.message };
    }
  }

  return {};
}
