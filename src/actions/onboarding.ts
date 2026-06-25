"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { addFeed } from "@/src/actions/feeds";
import {
  getAuthenticatedClient,
  validationError,
  type TypedSupabaseClient,
} from "@/src/actions/utils";
import { mapWithConcurrency } from "@/src/lib/guest/concurrency";
import { loadSampleFeedsDocument } from "@/src/lib/guest/sample-data";

import type { ActionResult } from "@/src/types/actions";

const ONBOARDING_SKIP_COOKIE = "frontpage-onboarding-skipped";
const IMPORT_CONCURRENCY = 4;

const APP_PATHS = [
  "/dashboard",
  "/category",
  "/feed",
  "/reader",
  "/onboarding",
];

export type StarterCategory = {
  name: string;
  feedCount: number;
};

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

export async function getStarterCategories(): Promise<
  ActionResult<StarterCategory[]>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const document = await loadSampleFeedsDocument();
  return {
    ok: true,
    data: document.categories.map((category) => ({
      name: category.name,
      feedCount: category.feeds.length,
    })),
  };
}

export async function getUserFeedCount(): Promise<ActionResult<number>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { count, error } = await supabase
    .from("feeds")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: count ?? 0 };
}

async function getOrCreateCategoryId(
  supabase: TypedSupabaseClient,
  userId: string,
  name: string,
  sortOrder: number,
): Promise<ActionResult<{ id: string }>> {
  const { data: existing, error: findError } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (findError) {
    return { ok: false, error: findError.message };
  }

  if (existing) {
    return { ok: true, data: { id: existing.id } };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { id: data.id } };
}

export async function importStarterFeeds(
  categoryNames: string[],
): Promise<ActionResult<{ added: number; failed: number }>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const trimmed = categoryNames.map((name) => name.trim()).filter(Boolean);

  if (trimmed.length === 0) {
    return validationError("Select at least one category.");
  }

  const document = await loadSampleFeedsDocument();
  const selected = new Set(trimmed);
  const categoriesToImport = document.categories.filter((category) =>
    selected.has(category.name),
  );

  if (categoriesToImport.length === 0) {
    return validationError("No valid categories selected.");
  }

  const { supabase, user } = auth;
  let added = 0;
  let failed = 0;

  for (const category of categoriesToImport) {
    const sortOrder = document.categories.indexOf(category);
    const categoryResult = await getOrCreateCategoryId(
      supabase,
      user.id,
      category.name,
      sortOrder,
    );

    if (!categoryResult.ok) {
      return categoryResult;
    }

    const results = await mapWithConcurrency(
      category.feeds,
      IMPORT_CONCURRENCY,
      async (feed) =>
        addFeed({
          url: feed.feedUrl,
          categoryId: categoryResult.data.id,
          customTitle: feed.title,
        }),
    );

    for (const result of results) {
      if (result.ok) {
        added += 1;
      } else {
        failed += 1;
      }
    }
  }

  if (added === 0) {
    return {
      ok: false,
      error: "Could not add any feeds. Try again or add a feed manually.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_SKIP_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidateAppPaths();
  return { ok: true, data: { added, failed } };
}

export async function skipOnboarding() {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_SKIP_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/dashboard");
}

export async function shouldShowOnboarding(): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get(ONBOARDING_SKIP_COOKIE)?.value === "1") {
    return false;
  }

  const countResult = await getUserFeedCount();
  if (!countResult.ok) {
    return false;
  }

  return countResult.data === 0;
}
