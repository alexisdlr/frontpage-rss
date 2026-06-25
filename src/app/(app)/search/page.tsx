import { searchFeedItems } from "@/src/actions/items";
import { FeedBrowseView } from "@/src/components/items/feed-browse-view";

type SeachPageProps = {
  searchParams: Promise<{ q: string }>;
};

const SeachPage = async ({ searchParams }: SeachPageProps) => {
  const { q } = await searchParams;

  const result = await searchFeedItems(q || "");

  if (!result.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">{result.error}</p>
      </div>
    );
  }
  const items = result.data;
  const totalCount = items.length;
  const nextCursor = null;
  const hasMore = false;

  return (
    <FeedBrowseView
      scope={{ type: "all" }}
      title={`Search results for "${q}"`}
      unreadCount={0}
      totalCount={totalCount}
      items={items}
      nextCursor={nextCursor}
      hasMore={hasMore}
    />
  );
};

export default SeachPage;
