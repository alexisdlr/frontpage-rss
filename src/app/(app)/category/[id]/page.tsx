import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCategories } from "@/src/actions/categories";
import { getFeedItems, getFeedItemCounts } from "@/src/actions/items";
import { getUnreadCounts } from "@/src/actions/read-state";
import { FeedBrowseView } from "@/src/components/items/feed-browse-view";
import { FeedItemListSkeleton } from "@/src/components/items/skeletons";

type CategoryPageProps = {
  params: Promise<{ id: string }>;
};

async function CategoryContent({ id }: { id: string }) {
  if (id === "uncategorized") {
    const scope = { type: "uncategorized" as const };

    const [itemsResult, countsResult, unreadResult] = await Promise.all([
      getFeedItems({ scope }),
      getFeedItemCounts({ scope }),
      getUnreadCounts(),
    ]);

    if (!itemsResult.ok) {
      return (
        <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
          <p className="text-sm text-text-secondary">{itemsResult.error}</p>
        </div>
      );
    }

    const unreadCount = unreadResult.ok ? unreadResult.data.uncategorized : 0;

    return (
      <FeedBrowseView
        scope={scope}
        title="Uncategorized"
        unreadCount={unreadCount}
        totalCount={
          countsResult.ok
            ? countsResult.data.total
            : itemsResult.data.items.length
        }
        items={itemsResult.data.items}
        nextCursor={itemsResult.data.nextCursor}
        hasMore={itemsResult.data.hasMore}
      />
    );
  }

  const categoriesResult = await getCategories();
  const category = categoriesResult.ok
    ? categoriesResult.data.find((entry) => entry.id === id)
    : null;

  if (!category) {
    notFound();
  }

  const scope = { type: "category" as const, categoryId: id };

  const [itemsResult, countsResult] = await Promise.all([
    getFeedItems({ scope }),
    getFeedItemCounts({ scope }),
  ]);

  if (!itemsResult.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">{itemsResult.error}</p>
      </div>
    );
  }

  return (
    <FeedBrowseView
      scope={scope}
      title={category.name}
      unreadCount={category.unreadCount}
      totalCount={
        countsResult.ok
          ? countsResult.data.total
          : itemsResult.data.items.length
      }
      items={itemsResult.data.items}
      nextCursor={itemsResult.data.nextCursor}
      hasMore={itemsResult.data.hasMore}
    />
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FeedItemListSkeleton />}>
      <CategoryContent id={id} />
    </Suspense>
  );
}
