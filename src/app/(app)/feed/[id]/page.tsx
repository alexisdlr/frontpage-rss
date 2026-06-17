import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getFeed } from "@/src/actions/feeds";
import { getFeedItems, getFeedItemCounts } from "@/src/actions/items";
import { FeedBrowseView } from "@/src/components/items/feed-browse-view";
import { FeedItemListSkeleton } from "@/src/components/items/skeletons";

type FeedPageProps = {
  params: Promise<{ id: string }>;
};

async function FeedContent({ id }: { id: string }) {
  const feedResult = await getFeed(id);

  if (!feedResult.ok) {
    notFound();
  }

  const feed = feedResult.data;
  const scope = { type: "feed" as const, feedId: id };

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
      title={feed.displayTitle}
      unreadCount={feed.unreadCount}
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

export default async function FeedPage({ params }: FeedPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FeedItemListSkeleton />}>
      <FeedContent id={id} />
    </Suspense>
  );
}
