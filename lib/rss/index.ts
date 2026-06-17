import { computeFeedHealth, nextFailureCount } from "./feedHealth";
import { fetchFeed } from "./fetchFeed";
import { isParseFeedError, parseFeedXml } from "./parseFeed";

import type {
  FeedHealth,
  FetchFeedOptions,
  ParsedFeed,
} from "@/types/rss";

export interface FetchAndParseResult {
  feed?: ParsedFeed;
  health: FeedHealth;
  etag?: string;
  lastModified?: string;
  notModified?: boolean;
  finalUrl: string;
}

export async function fetchAndParseFeed(
  options: FetchFeedOptions & {
    consecutiveFailures?: number;
    lastSuccessAt?: Date | null;
  },
): Promise<FetchAndParseResult> {
  const { consecutiveFailures = 0, lastSuccessAt, ...fetchOptions } = options;
  const lastFetchAt = new Date();

  const fetchResult = await fetchFeed(fetchOptions);

  if (fetchResult.notModified) {
    return {
      health: computeFeedHealth({
        lastSuccessAt,
        lastFetchAt,
        consecutiveFailures: 0,
      }),
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
      notModified: true,
      finalUrl: fetchResult.finalUrl,
    };
  }

  if (!fetchResult.ok) {
    const failures = nextFailureCount(consecutiveFailures, true);
    return {
      health: computeFeedHealth({
        lastSuccessAt,
        lastFetchAt,
        fetchError: fetchResult.error ?? "Fetch failed",
        consecutiveFailures: failures,
      }),
      finalUrl: fetchResult.finalUrl,
    };
  }

  try {
    const rawBody =
      "rawBuffer" in fetchResult && fetchResult.rawBuffer
        ? (fetchResult.rawBuffer as Buffer)
        : fetchResult.body;

    const feed = await parseFeedXml(
      rawBody,
      fetchResult.finalUrl,
      fetchResult.contentType,
    );

    const latestItemDate = feed.items.reduce<Date | null>((latest, item) => {
      if (!item.publishedAt) return latest;
      if (!latest || item.publishedAt > latest) return item.publishedAt;
      return latest;
    }, null);

    return {
      feed,
      health: computeFeedHealth({
        lastSuccessAt: lastFetchAt,
        lastFetchAt,
        consecutiveFailures: 0,
        latestItemDate,
      }),
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
      finalUrl: fetchResult.finalUrl,
    };
  } catch (error) {
    const failures = nextFailureCount(consecutiveFailures, true);
    const message = isParseFeedError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : "Failed to parse feed";

    return {
      feed: isParseFeedError(error) ? error.partial : undefined,
      health: computeFeedHealth({
        lastSuccessAt,
        lastFetchAt,
        fetchError: message,
        consecutiveFailures: failures,
      }),
      finalUrl: fetchResult.finalUrl,
    };
  }
}

export { fetchFeed } from "./fetchFeed";
export { parseFeedXml, isParseFeedError } from "./parseFeed";
export {
  normalizeItem,
  deduplicateItems,
  normalizeDate,
  normalizeText,
} from "./normalizeItem";
export {
  computeFeedHealth,
  calculateBackoffMs,
  shouldRetryFeed,
  nextFailureCount,
} from "./feedHealth";

export type { ParsedFeed, FeedHealth, NormalizedFeedItem } from "@/types/rss";
