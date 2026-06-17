import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

export function filterGuestItemsByScope(
  items: FeedItemWithMeta[],
  scope: ItemListScope,
): FeedItemWithMeta[] {
  switch (scope.type) {
    case "feed":
      return items.filter((item) => item.feedId === scope.feedId);
    case "category":
      return items.filter((item) => item.feed.categoryId === scope.categoryId);
    case "uncategorized":
      return items.filter((item) => item.feed.categoryId === null);
    default:
      return items;
  }
}

export function getGuestFeedIdsForScope(
  items: FeedItemWithMeta[],
  feeds: Array<{ id: string; category_id: string | null }>,
  scope: ItemListScope,
): string[] {
  switch (scope.type) {
    case "feed":
      return [scope.feedId];
    case "category":
      return feeds
        .filter((feed) => feed.category_id === scope.categoryId)
        .map((feed) => feed.id);
    case "uncategorized":
      return feeds
        .filter((feed) => feed.category_id === null)
        .map((feed) => feed.id);
    default:
      return feeds.map((feed) => feed.id);
  }
}
