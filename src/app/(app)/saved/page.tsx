import Link from "next/link";

import { getBookmarkedItems } from "@/src/actions/bookmarks";
import { FeedBrowseView } from "@/src/components/items/feed-browse-view";

export default async function SavedPage() {
  const result = await getBookmarkedItems();

  if (!result.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center md:mt-16">
        <p className="text-sm text-text-secondary">{result.error}</p>
      </div>
    );
  }

  const items = result.data;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center md:mt-16">
        <h1 className="text-xl font-semibold text-text-primary">
          No saved articles yet
        </h1>
        <p className="mt-2 text-sm text-text-secondary md:text-base">
          Save articles from your feed list or the reader using the bookmark
          button. They&apos;ll show up here for easy access later.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-text-secondary underline hover:text-text-primary md:text-base"
        >
          Browse your feeds
        </Link>
      </div>
    );
  }

  return (
    <FeedBrowseView
      scope={{ type: "all" }}
      title="Saved items"
      unreadCount={0}
      totalCount={items.length}
      items={items}
      nextCursor={null}
      hasMore={false}
    />
  );
}
