import { getFeedItems, getFeedItemCounts } from "@/actions/items";
import { getUnreadCounts } from "@/actions/read-state";
import { FeedBrowseView } from "@/components/items/feed-browse-view";
import { FeedItemListSkeleton } from "@/components/items/skeletons";
import { Suspense } from "react";

async function DashboardContent() {
  const scope = { type: "all" as const };

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

  const totalCount = countsResult.ok ? countsResult.data.total : itemsResult.data.items.length;
  const unreadCount = unreadResult.ok ? unreadResult.data.total : 0;

  return (
    <FeedBrowseView
      scope={scope}
      title="All items"
      unreadCount={unreadCount}
      totalCount={totalCount}
      items={itemsResult.data.items}
      nextCursor={itemsResult.data.nextCursor}
      hasMore={itemsResult.data.hasMore}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<FeedItemListSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
