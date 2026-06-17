export type FeedFormat = "rss" | "atom" | "rdf";

export type FeedHealthStatus = "active" | "stale" | "error";

export interface FetchFeedOptions {
  url: string;
  etag?: string | null;
  lastModified?: string | null;
  timeoutMs?: number;
  userAgent?: string;
}

export interface FetchFeedResult {
  ok: boolean;
  status: number;
  body: string;
  rawBuffer?: Buffer;
  etag?: string;
  lastModified?: string;
  contentType?: string;
  finalUrl: string;
  notModified?: boolean;
  error?: string;
}

export interface NormalizedFeedMeta {
  title: string;
  description?: string;
  siteUrl?: string;
  faviconUrl?: string;
  format: FeedFormat;
}

export interface NormalizedFeedItem {
  guid: string;
  url?: string;
  title: string;
  description?: string;
  contentHtml?: string;
  author?: string;
  publishedAt?: Date | null;
}

export interface ParsedFeed {
  meta: NormalizedFeedMeta;
  items: NormalizedFeedItem[];
}

export interface FeedHealth {
  status: FeedHealthStatus;
  lastSuccessAt?: Date | null;
  lastFetchAt?: Date | null;
  fetchError?: string | null;
  nextRetryAt?: Date | null;
  consecutiveFailures?: number;
}

export interface ParseFeedError {
  message: string;
  partial?: ParsedFeed;
}
