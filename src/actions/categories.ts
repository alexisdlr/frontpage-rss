"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedClient, validationError } from "@/src/actions/utils";
import { computeUnreadCounts } from "@/src/lib/db/readState";

import type {
  ActionResult,
  CategoryWithMeta,
  DeleteCategoryOptions,
  UnreadCounts,
} from "@/src/types/actions";

const APP_PATHS = ["/dashboard", "/category", "/feed", "/reader"];

function revalidateAppPaths() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

export async function getCategories(): Promise<
  ActionResult<CategoryWithMeta[]>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  const unreadCounts = await computeUnreadCounts(supabase, user.id);

  const withMeta: CategoryWithMeta[] = (categories ?? []).map((category) => ({
    ...category,
    unreadCount: unreadCounts.byCategory[category.id] ?? 0,
  }));

  return { ok: true, data: withMeta };
}

export async function createCategory(
  name: string,
): Promise<ActionResult<{ id: string }>> {
  const trimmed = name.trim();
  if (!trimmed) {
    return validationError("Category name is required.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: existing } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: trimmed,
      sort_order: nextSortOrder,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return validationError("A category with that name already exists.");
    }
    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true, data: { id: data.id } };
}

export async function renameCategory(
  categoryId: string,
  name: string,
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    return validationError("Category name is required.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return validationError("A category with that name already exists.");
    }
    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function deleteCategory(
  categoryId: string,
  options: DeleteCategoryOptions,
): Promise<ActionResult> {
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

  if (options.reassignToCategoryId) {
    const { data: target } = await supabase
      .from("categories")
      .select("id")
      .eq("id", options.reassignToCategoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!target) {
      return validationError("Target category not found.");
    }
  }

  const { error: feedError } = await supabase
    .from("feeds")
    .update({ category_id: options.reassignToCategoryId })
    .eq("category_id", categoryId)
    .eq("user_id", user.id);

  if (feedError) {
    return { ok: false, error: feedError.message };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function reorderCategories(
  orderedCategoryIds: string[],
): Promise<ActionResult> {
  if (orderedCategoryIds.length === 0) {
    return validationError("Category order cannot be empty.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { supabase, user } = auth;

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id);

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  const ownedIds = new Set((existing ?? []).map((category) => category.id));
  if (orderedCategoryIds.some((id) => !ownedIds.has(id))) {
    return validationError("One or more categories were not found.");
  }

  const updates = orderedCategoryIds.map((id, sortOrder) =>
    supabase
      .from("categories")
      .update({ sort_order: sortOrder })
      .eq("id", id)
      .eq("user_id", user.id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    return { ok: false, error: failed.error.message };
  }

  revalidateAppPaths();
  return { ok: true };
}

export async function getCategoryUnreadCounts(): Promise<
  ActionResult<Pick<UnreadCounts, "byCategory" | "uncategorized">>
> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const counts = await computeUnreadCounts(auth.supabase, auth.user.id);

  return {
    ok: true,
    data: {
      byCategory: counts.byCategory,
      uncategorized: counts.uncategorized,
    },
  };
}
