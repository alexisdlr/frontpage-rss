"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  CheckCheck,
  Circle,
  ExternalLink,
} from "lucide-react";

import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { useFeedItemActions } from "@/src/components/items/use-feed-item-actions";
import { HighlightText } from "@/src/components/shared/highlight-text";
import { Button } from "@/src/components/ui/button";
import {
  formatFullDate,
  formatPublishedDate,
} from "@/src/lib/format";
import type { FeedLayout } from "@/src/lib/layout";
import { cn } from "@/src/lib/utils";

import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

type FeedItemRowProps = {
  item: FeedItemWithMeta;
  scope: ItemListScope;
  highlightQuery?: string;
  layout?: FeedLayout;
};

export function FeedItemRow({
  item,
  scope,
  highlightQuery,
  layout = "standard",
}: FeedItemRowProps) {
  const {
    feedTitle,
    excerpt,
    useReader,
    readerHref,
    handleOpen,
    toggleRead,
    toggleBookmark,
  } = useFeedItemActions(item, scope);

  const isCompact = layout === "compact";

  return (
    <article
      className={cn(
        "group relative flex gap-3 px-1 transition-colors hover:bg-bg-tertiary/60",
        isCompact ? "py-2" : "py-4",
        item.isRead && "opacity-70",
      )}
    >
      <div className="flex shrink-0 items-start pt-1">
        {!item.isRead ? (
          <span
            className={cn(
              "rounded-full bg-unread",
              isCompact ? "mt-1 size-1.5" : "mt-1.5 size-2",
            )}
            aria-label="Unread"
          />
        ) : (
          <span
            className={cn(
              "rounded-full bg-transparent",
              isCompact ? "mt-1 size-1.5" : "mt-1.5 size-2",
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleOpen}
        className="min-w-0 flex-1 text-left focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {!isCompact ? (
            <FeedFavicon url={item.feed.faviconUrl} title={feedTitle} />
          ) : null}
          <span
            className={cn(
              "font-medium text-text-secondary",
              isCompact ? "text-[11px]" : "text-xs",
            )}
          >
            {feedTitle}
          </span>
          <span className="text-xs text-text-tertiary" aria-hidden="true">
            ·
          </span>
          <time
            className={cn(
              "text-text-tertiary",
              isCompact ? "text-[11px]" : "text-xs",
            )}
            dateTime={item.publishedAt ?? undefined}
            title={formatFullDate(item.publishedAt)}
          >
            {formatPublishedDate(item.publishedAt)}
          </time>
          {!isCompact && useReader ? (
            <span className="rounded-sm bg-accent-subtle px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
              Reader
            </span>
          ) : !isCompact ? (
            <ExternalLink
              className="size-3 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          ) : null}
        </div>

        <h2
          className={cn(
            "leading-snug text-text-primary",
            isCompact
              ? "mt-0.5 text-sm"
              : "mt-1 text-base leading-snug",
            !item.isRead ? "font-semibold" : "font-medium",
          )}
        >
          <HighlightText
            text={item.title?.trim() || "Untitled"}
            query={highlightQuery}
          />
        </h2>

        {!isCompact && excerpt ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            <HighlightText text={excerpt} query={highlightQuery} />
          </p>
        ) : null}
      </button>

      <div className="flex shrink-0 flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          onClick={toggleRead}
          aria-label={item.isRead ? "Mark as unread" : "Mark as read"}
          title={item.isRead ? "Mark as unread" : "Mark as read"}
        >
          {item.isRead ? (
            <Circle className="size-4" />
          ) : (
            <CheckCheck className="size-4" />
          )}
        </Button>

        {useReader ? (
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={readerHref}
              aria-label="Open in reader"
              title="Open in reader"
            >
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        ) : null}

        <Button
          variant="ghost"
          onClick={toggleBookmark}
          size="icon-sm"
          className="cursor-pointer"
          aria-label={
            item.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
          }
          title={
            item.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
          }
        >
          {item.isBookmarked ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </Button>
      </div>
    </article>
  );
}
