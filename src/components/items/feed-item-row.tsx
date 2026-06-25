"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, Circle, ExternalLink } from "lucide-react";

import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { Button } from "@/src/components/ui/button";
import { HighlightText } from "@/src/components/shared/highlight-text";
import {
  formatFullDate,
  formatPublishedDate,
  getFeedDisplayTitle,
  getItemExcerpt,
} from "@/src/lib/format";
import { buildReaderHref } from "@/src/lib/scope";
import { hasReaderContent } from "@/src/lib/sanitize";
import { cn } from "@/src/lib/utils";
import { markItemRead, setItemReadState } from "@/src/actions/read-state";

import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

type FeedItemRowProps = {
  item: FeedItemWithMeta;
  scope: ItemListScope;
  highlightQuery?: string;
};

export function FeedItemRow({ item, scope, highlightQuery }: FeedItemRowProps) {
  const router = useRouter();
  const feedTitle = getFeedDisplayTitle(item.feed);
  const excerpt = getItemExcerpt(item);
  const useReader = hasReaderContent(item.contentHtml);
  const readerHref = buildReaderHref(item.id, scope);

  async function handleOpen() {
    if (!item.isRead) {
      await markItemRead(item.id);
    }

    if (useReader) {
      router.push(readerHref);
      return;
    }

    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  async function toggleRead(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    await setItemReadState(item.id, !item.isRead);
    router.refresh();
  }

  return (
    <article
      className={cn(
        "group relative flex gap-3 border-b border-border-subtle px-1 py-4 transition-colors hover:bg-bg-tertiary/60",
        item.isRead && "opacity-70",
      )}
    >
      <div className="flex shrink-0 items-start pt-1">
        {!item.isRead ? (
          <span
            className="mt-1.5 size-2 rounded-full bg-unread"
            aria-label="Unread"
          />
        ) : (
          <span
            className="mt-1.5 size-2 rounded-full bg-transparent"
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
          <FeedFavicon url={item.feed.faviconUrl} title={feedTitle} />
          <span className="text-xs font-medium text-text-secondary">
            {feedTitle}
          </span>
          <span className="text-xs text-text-tertiary" aria-hidden="true">
            ·
          </span>
          <time
            className="text-xs text-text-tertiary"
            dateTime={item.publishedAt ?? undefined}
            title={formatFullDate(item.publishedAt)}
          >
            {formatPublishedDate(item.publishedAt)}
          </time>
          {useReader ? (
            <span className="rounded-sm bg-accent-subtle px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
              Reader
            </span>
          ) : (
            <ExternalLink
              className="size-3 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          )}
        </div>

        <h2
          className={cn(
            "mt-1 text-base leading-snug text-text-primary",
            !item.isRead ? "font-semibold" : "font-medium",
          )}
        >
          <HighlightText
            text={item.title?.trim() || "Untitled"}
            query={highlightQuery}
          />
        </h2>

        {excerpt ? (
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
      </div>
    </article>
  );
}
