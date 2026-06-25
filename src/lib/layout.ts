export const FEED_LAYOUTS = ["compact", "standard", "cards"] as const;

export type FeedLayout = (typeof FEED_LAYOUTS)[number];

export const DEFAULT_FEED_LAYOUT: FeedLayout = "standard";

export const LAYOUT_STORAGE_KEY = "frontpage-feed-layout";

export function isFeedLayout(value: string): value is FeedLayout {
  return (FEED_LAYOUTS as readonly string[]).includes(value);
}

export function parseFeedLayout(value: string | null | undefined): FeedLayout {
  if (value && isFeedLayout(value)) {
    return value;
  }
  return DEFAULT_FEED_LAYOUT;
}

/** First image in feed HTML, used for card layout thumbnails. */
export function extractItemImageUrl(
  description: string | null,
  contentHtml: string | null,
): string | null {
  for (const html of [contentHtml, description]) {
    if (!html) continue;
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];
  }
  return null;
}
