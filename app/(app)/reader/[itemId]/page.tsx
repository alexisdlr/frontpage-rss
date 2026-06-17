import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getAdjacentFeedItems,
  getFeedItem,
} from "@/actions/items";
import { markItemRead } from "@/actions/read-state";
import { ReaderArticle } from "@/components/reader/reader-article";
import { ReaderSkeleton } from "@/components/items/skeletons";
import { parseItemListScope } from "@/lib/scope";

type ReaderPageProps = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function ReaderContent({
  itemId,
  searchParams,
}: {
  itemId: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const scope = parseItemListScope(searchParams);

  const [itemResult, adjacentResult] = await Promise.all([
    getFeedItem(itemId),
    getAdjacentFeedItems(itemId, scope),
  ]);

  if (!itemResult.ok) {
    notFound();
  }

  if (!itemResult.data.isRead) {
    await markItemRead(itemId);
  }

  const adjacent = adjacentResult.ok
    ? adjacentResult.data
    : { previous: null, next: null };

  return (
    <ReaderArticle
      item={itemResult.data}
      scope={scope}
      previous={adjacent.previous}
      next={adjacent.next}
    />
  );
}

export default async function ReaderPage({
  params,
  searchParams,
}: ReaderPageProps) {
  const { itemId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<ReaderSkeleton />}>
      <ReaderContent itemId={itemId} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
