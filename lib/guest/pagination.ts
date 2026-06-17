import { GUEST_ITEMS_PAGE_SIZE } from "@/lib/guest/constants";

import type { FeedItemWithMeta, ItemCursor, PaginatedResult } from "@/types/actions";

function compareItems(a: FeedItemWithMeta, b: FeedItemWithMeta): number {
  const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;

  if (aTime !== bTime) {
    return bTime - aTime;
  }

  return b.id.localeCompare(a.id) * -1;
}

export function sortGuestItems(items: FeedItemWithMeta[]): FeedItemWithMeta[] {
  return [...items].sort(compareItems);
}

export function paginateGuestItems(
  items: FeedItemWithMeta[],
  input?: { cursor?: ItemCursor; limit?: number },
): PaginatedResult<FeedItemWithMeta> {
  const limit = input?.limit ?? GUEST_ITEMS_PAGE_SIZE;
  const sorted = sortGuestItems(items);

  let startIndex = 0;

  if (input?.cursor) {
    startIndex = sorted.findIndex((item) => {
      if (!item.publishedAt) return false;
      return (
        item.publishedAt < input.cursor!.publishedAt ||
        (item.publishedAt === input.cursor!.publishedAt &&
          item.id < input.cursor!.id)
      );
    });

    if (startIndex === -1) {
      return { items: [], nextCursor: null, hasMore: false };
    }
  }

  const page = sorted.slice(startIndex, startIndex + limit + 1);
  const hasMore = page.length > limit;
  const itemsPage = hasMore ? page.slice(0, limit) : page;
  const lastItem = itemsPage.at(-1);

  return {
    items: itemsPage,
    nextCursor:
      hasMore && lastItem?.publishedAt
        ? { publishedAt: lastItem.publishedAt, id: lastItem.id }
        : null,
    hasMore,
  };
}

export function getAdjacentGuestItems(
  items: FeedItemWithMeta[],
  itemId: string,
): { previous: FeedItemWithMeta | null; next: FeedItemWithMeta | null } {
  const sorted = sortGuestItems(items);
  const index = sorted.findIndex((item) => item.id === itemId);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}
