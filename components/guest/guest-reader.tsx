"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useEffect } from "react";

import { useGuest } from "@/components/guest/guest-provider";
import { FeedFavicon } from "@/components/items/feed-favicon";
import { Button } from "@/components/ui/button";
import {
  formatFullDate,
  getFeedDisplayTitle,
} from "@/lib/format";
import { buildGuestReaderHref, getGuestListHref } from "@/lib/guest/routes";
import { sanitizeArticleHtml } from "@/lib/sanitize";

import type { ItemListScope } from "@/types/actions";

type GuestReaderProps = {
  itemId: string;
  scope: ItemListScope;
};

export function GuestReader({ itemId, scope }: GuestReaderProps) {
  const { getItemById, getAdjacentItems, markItemRead } = useGuest();
  const item = getItemById(itemId);
  const { previous, next } = getAdjacentItems(itemId, scope);

  useEffect(() => {
    if (item && !item.isRead) {
      markItemRead(item.id);
    }
  }, [item, markItemRead]);

  if (!item) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">Article not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={getGuestListHref(scope)}>Back to list</Link>
        </Button>
      </div>
    );
  }

  const feedTitle = getFeedDisplayTitle(item.feed);
  const sanitizedHtml = item.contentHtml
    ? sanitizeArticleHtml(item.contentHtml)
    : null;

  return (
    <article className="mx-auto max-w-content">
      <header className="border-b border-border pb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={getGuestListHref(scope)}>← Back to list</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <FeedFavicon url={item.feed.faviconUrl} title={feedTitle} size="md" />
          <span className="font-medium">{feedTitle}</span>
          {item.author ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.author}</span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <time dateTime={item.publishedAt ?? undefined}>
            {formatFullDate(item.publishedAt)}
          </time>
        </div>

        <h1 className="mt-4 font-serif text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
          {item.title?.trim() || "Untitled"}
        </h1>

        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              View original
            </a>
          </Button>
        </div>
      </header>

      {sanitizedHtml ? (
        <div
          className="reader-content mt-8 font-serif text-base leading-loose text-text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        <div className="mt-8 space-y-4 font-serif text-base leading-loose text-text-secondary">
          {item.description ? <p>{item.description}</p> : null}
          <p>
            Full content is not available in the feed.{" "}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Read on the original site
            </a>
            .
          </p>
        </div>
      )}

      <nav
        className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between"
        aria-label="Article navigation"
      >
        {previous ? (
          <Button variant="outline" className="justify-start" asChild>
            <Link href={buildGuestReaderHref(previous.id, scope)}>
              <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{previous.title?.trim() || "Previous"}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}

        {next ? (
          <Button variant="outline" className="justify-end sm:ml-auto" asChild>
            <Link href={buildGuestReaderHref(next.id, scope)}>
              <span className="truncate">{next.title?.trim() || "Next"}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </nav>
    </article>
  );
}
