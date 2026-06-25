"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { extractItemImageUrl } from "@/src/lib/layout";
import { cn } from "@/src/lib/utils";

import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

type FeedItemCardProps = {
  item: FeedItemWithMeta;
  scope: ItemListScope;
  highlightQuery?: string;
};

export function FeedItemCard({ item, scope, highlightQuery }: FeedItemCardProps) {
  const {
    feedTitle,
    excerpt,
    useReader,
    readerHref,
    handleOpen,
    toggleRead,
    toggleBookmark,
  } = useFeedItemActions(item, scope);

  const imageUrl = extractItemImageUrl(item.description, item.contentHtml);

  return (
    <motion.article
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md",
        item.isRead && "opacity-80",
      )}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-h-0 flex-1 flex-col text-left focus-visible:outline-none"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-bg-tertiary">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-subtle to-bg-tertiary">
              <FeedFavicon
                url={item.feed.faviconUrl}
                title={feedTitle}
                size="md"
                className="size-10 text-lg"
              />
            </div>
          )}
          {!item.isRead ? (
            <span
              className="absolute left-3 top-3 size-2.5 rounded-full bg-unread ring-2 ring-surface"
              aria-label="Unread"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
            <FeedFavicon url={item.feed.faviconUrl} title={feedTitle} />
            <span className="font-medium">{feedTitle}</span>
            <span aria-hidden="true">·</span>
            <time
              dateTime={item.publishedAt ?? undefined}
              title={formatFullDate(item.publishedAt)}
            >
              {formatPublishedDate(item.publishedAt)}
            </time>
          </div>

          <h2
            className={cn(
              "mt-2 line-clamp-3 text-base leading-snug text-text-primary",
              !item.isRead ? "font-semibold" : "font-medium",
            )}
          >
            <HighlightText
              text={item.title?.trim() || "Untitled"}
              query={highlightQuery}
            />
          </h2>

          {excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
              <HighlightText text={excerpt} query={highlightQuery} />
            </p>
          ) : null}
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-border-subtle px-3 py-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
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
          size="icon-sm"
          onClick={toggleBookmark}
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
    </motion.article>
  );
}
