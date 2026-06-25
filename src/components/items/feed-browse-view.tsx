import { getCategories } from "@/src/actions/categories";
import { getFeed } from "@/src/actions/feeds";
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
  highlightQuery?: string;
};

export async function FeedBrowseView({
  scope,
  title,
  unreadCount,
  totalCount,
  items,

  nextCursor,
  hasMore,
  highlightQuery,
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

  const feedResult = scope.type === "feed" ? await getFeed(scope.feedId) : null;

  if (feedResult !== null && !feedResult.ok) {
    return <div>Error loading feed</div>;
  }

  const categories = await getCategories();
  if (!categories.ok) {
    return <div>Error loading categories</div>;
  }

  return (
    <>
      <FeedListHeader
        categories={categories.data}
        scope={scope}
        title={title}
        feed={feedResult?.data}
        unreadCount={unreadCount}
      />
      <FeedItemList
        scope={scope}
        initialItems={items}
        initialCursor={nextCursor}
        initialHasMore={hasMore}
        totalCount={totalCount}
        feedsInScope={feedsInScope}
        highlightQuery={highlightQuery}
        categories={scope.type === "all" ? categories.data : undefined}
      />
    </>
  );
}
