import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { Button } from "@/src/components/ui/button";
import { formatFullDate, getFeedDisplayTitle } from "@/src/lib/format";
import { buildReaderHref } from "@/src/lib/scope";
import { sanitizeArticleHtml } from "@/src/lib/sanitize";

import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

type ReaderArticleProps = {
  item: FeedItemWithMeta;
  scope: ItemListScope;
  previous: FeedItemWithMeta | null;
  next: FeedItemWithMeta | null;
};

export function ReaderArticle({
  item,
  scope,
  previous,
  next,
}: ReaderArticleProps) {
  const feedTitle = getFeedDisplayTitle(item.feed);
  const sanitizedHtml = item.contentHtml
    ? sanitizeArticleHtml(item.contentHtml)
    : null;

  return (
    <article className="mx-auto max-w-content">
      <header className="border-b border-border pb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={getBackHref(scope)}>← Back to list</Link>
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
            <Link href={buildReaderHref(previous.id, scope)}>
              <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {previous.title?.trim() || "Previous"}
              </span>
            </Link>
          </Button>
        ) : (
          <span />
        )}

        {next ? (
          <Button variant="outline" className="justify-end sm:ml-auto" asChild>
            <Link href={buildReaderHref(next.id, scope)}>
              <span className="truncate">{next.title?.trim() || "Next"}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </nav>
    </article>
  );
}

function getBackHref(scope: ItemListScope): string {
  switch (scope.type) {
    case "feed":
      return `/feed/${scope.feedId}`;
    case "category":
      return `/category/${scope.categoryId}`;
    case "uncategorized":
      return "/category/uncategorized";
    default:
      return "/dashboard";
  }
}
