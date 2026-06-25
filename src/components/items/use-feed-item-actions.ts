"use client";

import { useRouter } from "next/navigation";

import { toggleBookmarkItem } from "@/src/actions/bookmarks";
import { markItemRead, setItemReadState } from "@/src/actions/read-state";
import { getFeedDisplayTitle, getItemExcerpt } from "@/src/lib/format";
import { buildReaderHref } from "@/src/lib/scope";
import { hasReaderContent } from "@/src/lib/sanitize";

import type { FeedItemWithMeta, ItemListScope } from "@/src/types/actions";

export function useFeedItemActions(item: FeedItemWithMeta, scope: ItemListScope) {
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

  async function toggleBookmark(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const result = await toggleBookmarkItem(item.id, !item.isBookmarked);
    if (result.ok) {
      router.refresh();
    }
  }

  return {
    feedTitle,
    excerpt,
    useReader,
    readerHref,
    handleOpen,
    toggleRead,
    toggleBookmark,
  };
}
