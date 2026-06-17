"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Filter, Loader2 } from "lucide-react";

import { getFeedItems } from "@/actions/items";
import { FeedItemRow } from "@/components/items/feed-item-row";
import { FeedItemSkeleton } from "@/components/items/skeletons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  FeedItemWithMeta,
  ItemCursor,
  ItemListScope,
} from "@/types/actions";

type ReadFilter = "all" | "unread";

type FeedItemListProps = {
  scope: ItemListScope;
  initialItems: FeedItemWithMeta[];
  initialCursor: ItemCursor | null;
  initialHasMore: boolean;
  totalCount: number;
  feedsInScope?: Array<{ id: string; title: string }>;
};

export function FeedItemList({
  scope,
  initialItems,
  initialCursor,
  initialHasMore,
  totalCount,
  feedsInScope = [],
}: FeedItemListProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setFeedFilter("all");
  }, [initialItems, initialCursor, initialHasMore, scope]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursor) return;

    setIsLoadingMore(true);
    const result = await getFeedItems({ scope, cursor });

    if (result.ok) {
      setItems((current) => [...current, ...result.data.items]);
      setCursor(result.data.nextCursor);
      setHasMore(result.data.hasMore);
    }

    setIsLoadingMore(false);
  }, [cursor, hasMore, isLoadingMore, scope]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const filteredItems = items.filter((item) => {
    if (readFilter === "unread" && item.isRead) return false;
    if (feedFilter !== "all" && item.feedId !== feedFilter) return false;
    return true;
  });

  const unreadInList = items.filter((item) => !item.isRead).length;

  function handleFilterChange(next: ReadFilter) {
    startTransition(() => {
      setReadFilter(next);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
        <p className="text-lg font-medium text-text-primary">No items yet</p>
        <p className="mt-2 text-sm text-text-secondary">
          Add feeds or refresh existing subscriptions to see articles here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          {totalCount.toLocaleString()} {totalCount === 1 ? "item" : "items"}
          {unreadInList > 0 ? (
            <span className="text-text-tertiary">
              {" "}
              · {unreadInList} unread loaded
            </span>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {feedsInScope.length > 1 ? (
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <Filter
                className="size-4 shrink-0 text-text-tertiary"
                aria-hidden="true"
              />
              <span className="sr-only">Filter by feed</span>
              <select
                value={feedFilter}
                onChange={(event) => setFeedFilter(event.target.value)}
                className="min-h-9 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-primary"
              >
                <option value="all">All feeds</option>
                {feedsInScope.map((feed) => (
                  <option key={feed.id} value={feed.id}>
                    {feed.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div
            className="inline-flex rounded-md border border-border bg-surface p-0.5"
            role="group"
            aria-label="Read status filter"
          >
            {(["all", "unread"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  "min-h-8 px-3 capitalize",
                  readFilter === value && "bg-accent-subtle text-accent",
                )}
                aria-pressed={readFilter === value}
                onClick={() => handleFilterChange(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isPending ? <FeedItemSkeleton count={3} /> : null}

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
          <p className="text-sm text-text-secondary">
            No items match the current filters.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setReadFilter("all");
              setFeedFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <ul className="divide-y divide-border-subtle">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <FeedItemRow item={item} scope={scope} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isLoadingMore ? (
          <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading more…
          </span>
        ) : hasMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadMore()}
          >
            Load more
          </Button>
        ) : items.length > 0 ? (
          <p className="text-sm text-text-tertiary">
            You&apos;ve reached the end
          </p>
        ) : null}
      </div>
    </div>
  );
}
