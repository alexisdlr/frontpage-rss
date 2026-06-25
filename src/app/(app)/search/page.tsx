import { searchFeedItems } from "@/src/actions/items";
import { FeedBrowseView } from "@/src/components/items/feed-browse-view";
import { FeedItemListSkeleton } from "@/src/components/items/skeletons";
import Link from "next/link";
import { Suspense } from "react";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function SearchContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  if (!term) {
    return (
      <div className="rounded-lg border border-border md:mt-16 bg-surface px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-text-primary">Search</h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Use the search bar to find articles across your feeds.
        </p>
      </div>
    );
  }

  const result = await searchFeedItems(term);

  if (!result.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">{result.error}</p>
      </div>
    );
  }

  const items = result.data;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border md:mt-16 bg-surface px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-text-primary">
          No results for &quot;{term}&quot;
        </h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Check your spelling or try a different search term.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm underline text-text-secondary md:text-base hover:text-text-primary"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <FeedBrowseView
      scope={{ type: "all" }}
      title={`Search results for "${term}"`}
      unreadCount={0}
      totalCount={items.length}
      items={items}
      nextCursor={null}
      hasMore={false}
      highlightQuery={term}
    />
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<FeedItemListSkeleton />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
