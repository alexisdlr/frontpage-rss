"use server";

import { revalidatePath } from "next/cache";

import {
  getAuthenticatedClient,
  validationError,
} from "@/actions/utils";
import {
  computeUnreadCounts,
  getFeedIdsForScope,
  getUnreadItemIdsForFeeds,
  upsertReadStateForItems,
} from "@/lib/db/readState";

import type { ActionResult, UnreadCounts } from "@/types/actions";

const APP_PATHS = ["/dashboard", "/category", "/feed", "/reader"];

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

export async function getUnreadCounts(): Promise<ActionResult<UnreadCounts>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const counts = await computeUnreadCounts(auth.supabase, auth.user.id);
  return { ok: true, data: counts };
}

export async function setItemReadState(
  itemId: string,
  isRead: boolean,
): Promise<ActionResult> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

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

  const result = await upsertReadStateForItems(
    supabase,
    user.id,
    [itemId],
    isRead,
  );

  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function markItemRead(itemId: string): Promise<ActionResult> {
  return setItemReadState(itemId, true);
}

export async function markItemUnread(itemId: string): Promise<ActionResult> {
  return setItemReadState(itemId, false);
}

export async function markAllReadInFeed(feedId: string): Promise<
  ActionResult<{ updated: number }>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: feed } = await supabase
    .from("feeds")
    .select("id")
    .eq("id", feedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!feed) {
    return validationError("Feed not found.");
  }

  const unreadItemIds = await getUnreadItemIdsForFeeds(supabase, user.id, [
    feedId,
  ]);

  const result = await upsertReadStateForItems(
    supabase,
    user.id,
    unreadItemIds,
    true,
  );

  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidateAppPaths();
  return { ok: true, data: { updated: unreadItemIds.length } };
}

export async function markAllReadInCategory(
  categoryId: string,
): Promise<ActionResult<{ updated: number }>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!category) {
    return validationError("Category not found.");
  }

  const feedIds = await getFeedIdsForScope(supabase, user.id, {
    type: "category",
    categoryId,
  });

  const unreadItemIds = await getUnreadItemIdsForFeeds(
    supabase,
    user.id,
    feedIds,
  );

  const result = await upsertReadStateForItems(
    supabase,
    user.id,
    unreadItemIds,
    true,
  );

  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidateAppPaths();
  return { ok: true, data: { updated: unreadItemIds.length } };
}

export async function markAllReadUncategorized(): Promise<
  ActionResult<{ updated: number }>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const feedIds = await getFeedIdsForScope(auth.supabase, auth.user.id, {
    type: "uncategorized",
  });

  const unreadItemIds = await getUnreadItemIdsForFeeds(
    auth.supabase,
    auth.user.id,
    feedIds,
  );

  const result = await upsertReadStateForItems(
    auth.supabase,
    auth.user.id,
    unreadItemIds,
    true,
  );

  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidateAppPaths();
  return { ok: true, data: { updated: unreadItemIds.length } };
}

export async function markAllReadGlobally(): Promise<
  ActionResult<{ updated: number }>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const feedIds = await getFeedIdsForScope(auth.supabase, auth.user.id, {
    type: "all",
  });

  const unreadItemIds = await getUnreadItemIdsForFeeds(
    auth.supabase,
    auth.user.id,
    feedIds,
  );

  const result = await upsertReadStateForItems(
    auth.supabase,
    auth.user.id,
    unreadItemIds,
    true,
  );

  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidateAppPaths();
  return { ok: true, data: { updated: unreadItemIds.length } };
}
