"use server";

import { revalidatePath } from "next/cache";

import {
  getAuthenticatedClient,
  isValidHttpUrl,
  validationError,
} from "@/actions/utils";
import { upsertFeedItems } from "@/lib/db/syncFeedItems";
import { computeUnreadCounts } from "@/lib/db/readState";
import { fetchAndParseFeed } from "@/lib/rss";

import type { ActionResult, FeedWithMeta } from "@/types/actions";

const APP_PATHS = ["/dashboard", "/category", "/feed", "/reader"];

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

function displayTitle(feed: {
  custom_title: string | null;
  url: string;
}): string {
  return feed.custom_title?.trim() || feed.url;
}

export async function getFeeds(): Promise<ActionResult<FeedWithMeta[]>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: feeds, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("user_id", user.id)
    .order("custom_title", { ascending: true, nullsFirst: false })
    .order("url", { ascending: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  const unreadCounts = await computeUnreadCounts(supabase, user.id);

  const withMeta: FeedWithMeta[] = (feeds ?? []).map((feed) => ({
    ...feed,
    unreadCount: unreadCounts.byFeed[feed.id] ?? 0,
    displayTitle: displayTitle(feed),
  }));

  return { ok: true, data: withMeta };
}

export async function getFeed(feedId: string): Promise<ActionResult<FeedWithMeta>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: feed, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("id", feedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!feed) {
    return validationError("Feed not found.");
  }

  const unreadCounts = await computeUnreadCounts(supabase, user.id);

  return {
    ok: true,
    data: {
      ...feed,
      unreadCount: unreadCounts.byFeed[feed.id] ?? 0,
      displayTitle: displayTitle(feed),
    },
  };
}

export async function addFeed(input: {
  url: string;
  categoryId?: string | null;
  customTitle?: string;
}): Promise<ActionResult<{ id: string }>> {
  const url = input.url.trim();

  if (!url) {
    return validationError("Feed URL is required.");
  }

  if (!isValidHttpUrl(url)) {
    return validationError("Enter a valid http or https URL.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  if (input.categoryId) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", input.categoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!category) {
      return validationError("Category not found.");
    }
  }

  const { data: duplicate } = await supabase
    .from("feeds")
    .select("id")
    .eq("user_id", user.id)
    .eq("url", url)
    .maybeSingle();

  if (duplicate) {
    return validationError("You are already subscribed to this feed.");
  }

  const parsed = await fetchAndParseFeed({ url });

  if (!parsed.feed) {
    return {
      ok: false,
      error: parsed.health.fetchError ?? "Could not parse feed.",
    };
  }

  const now = new Date().toISOString();
  const { data: feed, error } = await supabase
    .from("feeds")
    .insert({
      user_id: user.id,
      url: parsed.finalUrl || url,
      category_id: input.categoryId ?? null,
      custom_title: input.customTitle?.trim() || parsed.feed.meta.title || null,
      site_url: parsed.feed.meta.siteUrl ?? null,
      description: parsed.feed.meta.description ?? null,
      favicon_url: parsed.feed.meta.faviconUrl ?? null,
      health_status: parsed.health.status,
      last_fetch_at: now,
      last_success_at: now,
      etag: parsed.etag ?? null,
      last_modified: parsed.lastModified ?? null,
      fetch_error: parsed.health.fetchError ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return validationError("You are already subscribed to this feed.");
    }
    return { ok: false, error: error.message };
  }

  const syncResult = await upsertFeedItems(
    supabase,
    feed.id,
    parsed.feed.items,
  );

  if (syncResult.error) {
    return { ok: false, error: syncResult.error };
  }

  revalidateAppPaths();
  return { ok: true, data: { id: feed.id } };
}

export async function updateFeed(
  feedId: string,
  input: {
    customTitle?: string | null;
    categoryId?: string | null;
  },
): Promise<ActionResult> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  if (input.categoryId) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", input.categoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!category) {
      return validationError("Category not found.");
    }
  }

  const updates: {
    custom_title?: string | null;
    category_id?: string | null;
  } = {};

  if (input.customTitle !== undefined) {
    updates.custom_title = input.customTitle?.trim() || null;
  }

  if (input.categoryId !== undefined) {
    updates.category_id = input.categoryId;
  }

  if (Object.keys(updates).length === 0) {
    return validationError("No changes provided.");
  }

  const { error } = await supabase
    .from("feeds")
    .update(updates)
    .eq("id", feedId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function deleteFeed(feedId: string): Promise<ActionResult> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { error } = await supabase
    .from("feeds")
    .delete()
    .eq("id", feedId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function refreshFeed(feedId: string): Promise<
  ActionResult<{
    notModified: boolean;
    itemsSynced: number;
    healthStatus: string;
  }>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: feed, error: fetchError } = await supabase
    .from("feeds")
    .select("*")
    .eq("id", feedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  if (!feed) {
    return validationError("Feed not found.");
  }

  const consecutiveFailures =
    feed.health_status === "error" && feed.fetch_error ? 1 : 0;

  const result = await fetchAndParseFeed({
    url: feed.url,
    etag: feed.etag,
    lastModified: feed.last_modified,
    consecutiveFailures,
    lastSuccessAt: feed.last_success_at
      ? new Date(feed.last_success_at)
      : null,
  });

  const now = new Date().toISOString();
  const lastSuccessAt = result.notModified
    ? feed.last_success_at
    : result.health.lastSuccessAt?.toISOString() ?? feed.last_success_at;

  const { error: updateError } = await supabase
    .from("feeds")
    .update({
      url: result.finalUrl || feed.url,
      health_status: result.health.status,
      last_fetch_at: now,
      last_success_at: lastSuccessAt,
      etag: result.etag ?? feed.etag,
      last_modified: result.lastModified ?? feed.last_modified,
      fetch_error: result.health.fetchError ?? null,
      ...(result.feed && !feed.custom_title
        ? {
            site_url: result.feed.meta.siteUrl ?? feed.site_url,
            description: result.feed.meta.description ?? feed.description,
            favicon_url: result.feed.meta.faviconUrl ?? feed.favicon_url,
          }
        : {}),
    })
    .eq("id", feedId)
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  if (result.notModified || !result.feed) {
    revalidateAppPaths();
    return {
      ok: true,
      data: {
        notModified: result.notModified ?? false,
        itemsSynced: 0,
        healthStatus: result.health.status,
      },
    };
  }

  const syncResult = await upsertFeedItems(
    supabase,
    feedId,
    result.feed.items,
  );

  if (syncResult.error) {
    return { ok: false, error: syncResult.error };
  }

  revalidateAppPaths();
  return {
    ok: true,
    data: {
      notModified: false,
      itemsSynced: syncResult.inserted,
      healthStatus: result.health.status,
    },
  };
}

export async function validateFeedUrl(
  url: string,
): Promise<
  ActionResult<{
    title: string;
    description?: string;
    siteUrl?: string;
    faviconUrl?: string;
    itemCount: number;
  }>
> {
  const trimmed = url.trim();

  if (!trimmed) {
    return validationError("Feed URL is required.");
  }

  if (!isValidHttpUrl(trimmed)) {
    return validationError("Enter a valid http or https URL.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const result = await fetchAndParseFeed({ url: trimmed });

  if (!result.feed) {
    return {
      ok: false,
      error: result.health.fetchError ?? "Could not parse feed.",
    };
  }

  return {
    ok: true,
    data: {
      title: result.feed.meta.title,
      description: result.feed.meta.description,
      siteUrl: result.feed.meta.siteUrl,
      faviconUrl: result.feed.meta.faviconUrl,
      itemCount: result.feed.items.length,
    },
  };
}
