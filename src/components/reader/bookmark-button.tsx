"use client";

import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { toggleBookmarkItem } from "@/src/actions/bookmarks";
import { Button } from "@/src/components/ui/button";

import type { FeedItemWithMeta } from "@/src/types/actions";

type BookmarkButtonProps = {
  item: FeedItemWithMeta;
};

export function BookmarkButton({ item }: BookmarkButtonProps) {
  const router = useRouter();

  async function toggleBookmark() {
    const result = await toggleBookmarkItem(item.id, !item.isBookmarked);
    if (result.ok) {
      router.refresh();
    }
  }

  const label = item.isBookmarked ? "Remove from saved" : "Save article";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggleBookmark}
      size="sm"
      aria-pressed={item.isBookmarked}
      aria-label={label}
      title={label}
    >
      {item.isBookmarked ? (
        <BookmarkCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}