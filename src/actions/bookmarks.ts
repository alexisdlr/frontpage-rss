"use server";

import { revalidatePath } from "next/cache";

import {
  FEED_ITEM_SELECT,
  getAuthenticatedClient,
  mapFeedItemRow,
  validationError,
  type DbFeedItemQueryRow,
} from "@/src/actions/utils";

import type { ActionResult, BookmarkedItemWithMeta } from "@/src/types/actions";

/** One row from: bookmarks → feed_items (FEED_ITEM_SELECT). */
type BookmarkListRow = {
  created_at: string;
  feed_items: DbFeedItemQueryRow | null;
};

function toSavedPageItem(row: DbFeedItemQueryRow): BookmarkedItemWithMeta {
  return { ...mapFeedItemRow(row), isBookmarked: true };
}

const APP_PATHS = [
  "/dashboard",
  "/category",
  "/feed",
  "/reader",
  "/search",
  "/saved",
];

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

/**
 * Set bookmark state for an item (same pattern as setItemReadState).
 * @param isBookmarked — desired state (true = save, false = remove)
 */
export async function toggleBookmarkItem(
  itemId: string,
  isBookmarked: boolean,
): Promise<ActionResult<{ isBookmarked: boolean }>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  if (!itemId) {
    return validationError("Item ID is required.");
  }

  const { data: item, error: itemError } = await supabase
    .from("feed_items")
    .select("id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    return { ok: false, error: itemError.message };
  }

  if (!item) {
    return validationError("Item not found.");
  }

  if (!isBookmarked) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidateAppPaths();
    return { ok: true, data: { isBookmarked: false } };
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    item_id: itemId,
  });

  if (error) {
    // Already bookmarked — treat as success for idempotent UI toggles
    if (error.code === "23505") {
      revalidateAppPaths();
      return { ok: true, data: { isBookmarked: true } };
    }

    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true, data: { isBookmarked: true } };
}

export async function getBookmarkedItems(): Promise<
  ActionResult<BookmarkedItemWithMeta[]>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      created_at,
      feed_items (
        ${FEED_ITEM_SELECT}
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as BookmarkListRow[];
  const items: BookmarkedItemWithMeta[] = [];

  for (const bookmark of rows) {
    if (!bookmark.feed_items) continue;
    items.push(toSavedPageItem(bookmark.feed_items));
  }

  return {
    ok: true,
    data: items,
  };
}
