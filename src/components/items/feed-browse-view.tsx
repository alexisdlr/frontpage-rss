import { FeedItemList } from "@/src/components/items/feed-item-list";
import { FeedListHeader } from "@/src/components/items/feed-list-header";
import { getFeedDisplayTitle } from "@/src/lib/format";

import type {
  FeedItemWithMeta,
  ItemCursor,
  ItemListScope,
} from "@/src/types/actions";

type FeedBrowseViewProps = {
  scope: ItemListScope;
  title: string;
  unreadCount: number;
  totalCount: number;
  items: FeedItemWithMeta[];
  nextCursor: ItemCursor | null;
  hasMore: boolean;
};

export function FeedBrowseView({
  scope,
  title,
  unreadCount,
  totalCount,
  items,
  nextCursor,
  hasMore,
}: FeedBrowseViewProps) {
  const feedsInScope = Array.from(
    new Map(
      items.map((item) => [
        item.feedId,
        {
          id: item.feedId,
          title: getFeedDisplayTitle(item.feed),
        },
      ]),
    ).values(),
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <FeedListHeader scope={scope} title={title} unreadCount={unreadCount} />
      <FeedItemList
        scope={scope}
        initialItems={items}
        initialCursor={nextCursor}
        initialHasMore={hasMore}
        totalCount={totalCount}
        feedsInScope={feedsInScope}
      />
    </>
  );
}
