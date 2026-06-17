import { cache } from "react";

import { fetchGuestFeedResults } from "@/lib/guest/fetch-feeds";
import {
  getGuestCategoriesFromSample,
  getGuestFeedDefinitions,
} from "@/lib/guest/sample-data";
import { sortGuestItems } from "@/lib/guest/pagination";
import { computeGuestUnreadCounts } from "@/lib/guest/unread";
import {
  GUEST_DATA_CACHE_TTL_MS,
} from "@/lib/guest/constants";
import type { GuestFeedData } from "@/lib/guest/types";

import type { CategoryWithMeta, FeedWithMeta } from "@/types/actions";

let memoryCache: { data: GuestFeedData; expiresAt: number } | null = null;

function buildGuestFeedData(
  categories: Array<{ id: string; name: string; sortOrder: number }>,
  fetchResults: Awaited<ReturnType<typeof fetchGuestFeedResults>>,
): GuestFeedData {
  const feedErrors: Record<string, string> = {};
  const feedMetaById = new Map<
    string,
    (typeof fetchResults)[number]["feedMeta"]
  >();

  for (const result of fetchResults) {
    feedMetaById.set(result.feedId, result.feedMeta);
    if (!result.ok && result.error) {
      feedErrors[result.feedId] = result.error;
    }
  }

  const items = sortGuestItems(fetchResults.flatMap((result) => result.items));
  const unreadCounts = computeGuestUnreadCounts(items, {});

  const feeds: FeedWithMeta[] = fetchResults.map((result) => {
    const meta = result.feedMeta;

    return {
      id: result.feedId,
      user_id: "guest",
      category_id: meta.categoryId,
      url: meta.url,
      custom_title: meta.title,
      site_url: meta.siteUrl,
      description: meta.description,
      favicon_url: meta.faviconUrl,
      health_status: result.ok ? "active" : "error",
      last_fetch_at: new Date().toISOString(),
      last_success_at: result.ok ? new Date().toISOString() : null,
      etag: null,
      last_modified: null,
      fetch_error: result.error ?? null,
      created_at: new Date().toISOString(),
      unreadCount: unreadCounts.byFeed[result.feedId] ?? 0,
      displayTitle: meta.title,
    };
  });

  const categoriesWithMeta: CategoryWithMeta[] = categories.map((category) => ({
    id: category.id,
    user_id: "guest",
    name: category.name,
    sort_order: category.sortOrder,
    created_at: new Date().toISOString(),
    unreadCount: unreadCounts.byCategory[category.id] ?? 0,
  }));

  return {
    categories: categoriesWithMeta,
    feeds,
    items,
    unreadCounts,
    fetchedAt: new Date().toISOString(),
    feedErrors,
  };
}

async function loadGuestFeedDataUncached(): Promise<GuestFeedData> {
  const [categories, feedDefinitions] = await Promise.all([
    getGuestCategoriesFromSample(),
    getGuestFeedDefinitions(),
  ]);

  const fetchResults = await fetchGuestFeedResults(feedDefinitions);
  return buildGuestFeedData(categories, fetchResults);
}

export const loadGuestFeedData = cache(async (): Promise<GuestFeedData> => {
  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.data;
  }

  const data = await loadGuestFeedDataUncached();
  memoryCache = {
    data,
    expiresAt: Date.now() + GUEST_DATA_CACHE_TTL_MS,
  };

  return data;
});
