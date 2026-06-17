import type { FeedItemWithMeta, UnreadCounts } from "@/types/actions";

export type GuestReadStateMap = Record<
  string,
  {
    isRead: boolean;
    readAt: string | null;
  }
>;

export function applyGuestReadState(
  items: FeedItemWithMeta[],
  readState: GuestReadStateMap,
): FeedItemWithMeta[] {
  return items.map((item) => {
    const state = readState[item.id];
    if (!state) return item;

    return {
      ...item,
      isRead: state.isRead,
      readAt: state.readAt,
    };
  });
}

export function computeGuestUnreadCounts(
  items: FeedItemWithMeta[],
  readState: GuestReadStateMap,
): UnreadCounts {
  const byFeed: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let total = 0;
  let uncategorized = 0;

  for (const item of items) {
    const isRead = readState[item.id]?.isRead ?? item.isRead;
    if (isRead) continue;

    total += 1;
    byFeed[item.feedId] = (byFeed[item.feedId] ?? 0) + 1;

    if (item.feed.categoryId) {
      byCategory[item.feed.categoryId] =
        (byCategory[item.feed.categoryId] ?? 0) + 1;
    } else {
      uncategorized += 1;
    }
  }

  return { total, uncategorized, byFeed, byCategory };
}

export function getUnreadGuestItemIds(
  items: FeedItemWithMeta[],
  readState: GuestReadStateMap,
  feedIds?: string[],
): string[] {
  const feedIdSet = feedIds ? new Set(feedIds) : null;

  return items
    .filter((item) => {
      if (feedIdSet && !feedIdSet.has(item.feedId)) return false;
      return !(readState[item.id]?.isRead ?? item.isRead);
    })
    .map((item) => item.id);
}
