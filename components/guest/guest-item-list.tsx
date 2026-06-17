"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { CheckCheck, ChevronDown, Filter, Loader2 } from "lucide-react";

import { useGuest } from "@/components/guest/guest-provider";
import { GuestItemRow } from "@/components/guest/guest-item-row";
import { FeedItemSkeleton } from "@/components/items/skeletons";
import { Button } from "@/components/ui/button";
import { GUEST_ITEMS_PAGE_SIZE } from "@/lib/guest/constants";
import { getFeedDisplayTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { ItemListScope } from "@/types/actions";

type ReadFilter = "all" | "unread";

type GuestItemListProps = {
  scope: ItemListScope;
  title: string;
  unreadCount: number;
};

export function GuestItemList({
  scope,
  title,
  unreadCount,
}: GuestItemListProps) {
  const { getItemsForScope, markAllReadInScope, isHydrated } = useGuest();
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(GUEST_ITEMS_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const scopedItems = getItemsForScope(scope);
  const totalCount = scopedItems.length;
  const loadedItems = scopedItems.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    setVisibleCount(GUEST_ITEMS_PAGE_SIZE);
    setFeedFilter("all");
  }, [scope, isHydrated]);

  const feedsInScope = useMemo(
    () =>
      Array.from(
        new Map(
          getItemsForScope(scope).map((item) => [
            item.feedId,
            {
              id: item.feedId,
              title: getFeedDisplayTitle(item.feed),
            },
          ]),
        ).values(),
      ).sort((a, b) => a.title.localeCompare(b.title)),
    [getItemsForScope, scope],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setVisibleCount((current) => current + GUEST_ITEMS_PAGE_SIZE);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const filteredItems = loadedItems.filter((item) => {
    if (readFilter === "unread" && item.isRead) return false;
    if (feedFilter !== "all" && item.feedId !== feedFilter) return false;
    return true;
  });

  const unreadInList = loadedItems.filter((item) => !item.isRead).length;

  function handleMarkAllRead() {
    startTransition(() => {
      markAllReadInScope(scope);
      setMenuOpen(false);
    });
  }

  if (!isHydrated) {
    return <FeedItemSkeleton count={8} />;
  }

  if (totalCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
        <p className="text-lg font-medium text-text-primary">No items yet</p>
        <p className="mt-2 text-sm text-text-secondary">
          Feeds are still loading or none returned articles for this view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {unreadCount > 0 ? (
              <span>{unreadCount} unread</span>
            ) : (
              <span>All caught up</span>
            )}
          </p>
        </div>

        {unreadCount > 0 ? (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10"
              disabled={isPending}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all read
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-border bg-surface p-1 shadow-md"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full rounded-sm px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                    disabled={isPending}
                    onClick={handleMarkAllRead}
                  >
                    Mark all in {title.toLowerCase()} as read
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

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
                onClick={() =>
                  startTransition(() => {
                    setReadFilter(value);
                  })
                }
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
                <GuestItemRow item={item} scope={scope} />
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
          <Button type="button" variant="outline" size="sm" onClick={loadMore}>
            Load more
          </Button>
        ) : loadedItems.length > 0 ? (
          <p className="text-sm text-text-tertiary">
            You&apos;ve reached the end
          </p>
        ) : null}
      </div>
    </div>
  );
}
