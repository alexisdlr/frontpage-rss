import { fetchAndParseFeed } from "@/src/lib/rss";
import { mapWithConcurrency } from "@/src/lib/guest/concurrency";
import { GUEST_FETCH_CONCURRENCY } from "@/src/lib/guest/constants";
import { guestItemId } from "@/src/lib/guest/ids";
import type { GuestFeedDefinition } from "@/src/lib/guest/sample-data";
import type { GuestFeedFetchResult } from "@/src/lib/guest/types";

import type { FeedItemWithMeta } from "@/src/types/actions";

function mapParsedItem(
  feed: GuestFeedDefinition,
  item: {
    guid: string;
    url?: string;
    title: string;
    description?: string;
    contentHtml?: string;
    author?: string;
    publishedAt?: Date | null;
  },
  fetchedAt: string,
): FeedItemWithMeta {
  const feedId = feed.id;

  return {
    id: guestItemId(feedId, item.guid),
    feedId,
    guid: item.guid,
    url: item.url ?? feed.siteUrl,
    title: item.title,
    description: item.description ?? null,
    contentHtml: item.contentHtml ?? null,
    author: item.author ?? null,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    fetchedAt,
    isRead: false,
    readAt: null,
    feed: {
      id: feedId,
      customTitle: feed.title,
      faviconUrl: null,
      siteUrl: feed.siteUrl,
      categoryId: feed.categoryId,
      url: feed.feedUrl,
    },
  };
}

async function fetchSingleGuestFeed(
  feed: GuestFeedDefinition,
): Promise<GuestFeedFetchResult> {
  const fetchedAt = new Date().toISOString();
  const result = await fetchAndParseFeed({ url: feed.feedUrl });

  const baseMeta = {
    title: feed.title,
    description: feed.description ?? null,
    siteUrl: feed.siteUrl ?? null,
    faviconUrl: null as string | null,
    url: feed.feedUrl,
    categoryId: feed.categoryId,
  };

  if (!result.feed) {
    return {
      feedId: feed.id,
      ok: false,
      error: result.health.fetchError ?? "Failed to fetch feed",
      items: [],
      feedMeta: baseMeta,
    };
  }

  const faviconUrl = result.feed.meta.faviconUrl ?? null;
  const items = result.feed.items.map((item) => {
    const mapped = mapParsedItem(feed, item, fetchedAt);
    return {
      ...mapped,
      feed: {
        ...mapped.feed,
        faviconUrl,
      },
    };
  });

  return {
    feedId: feed.id,
    ok: true,
    items,
    feedMeta: {
      ...baseMeta,
      title: result.feed.meta.title?.trim() || feed.title,
      description: result.feed.meta.description ?? feed.description ?? null,
      siteUrl: result.feed.meta.siteUrl ?? feed.siteUrl ?? null,
      faviconUrl,
    },
  };
}

export async function fetchGuestFeedResults(
  feeds: GuestFeedDefinition[],
): Promise<GuestFeedFetchResult[]> {
  return mapWithConcurrency(
    feeds,
    GUEST_FETCH_CONCURRENCY,
    fetchSingleGuestFeed,
  );
}
