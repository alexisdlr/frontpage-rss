"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedClient, validationError } from "@/src/actions/utils";
import {
  DEFAULT_FEED_LAYOUT,
  isFeedLayout,
  parseFeedLayout,
  type FeedLayout,
} from "@/src/lib/layout";

import type { ActionResult } from "@/src/types/actions";

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

export async function getUserLayout(): Promise<ActionResult<FeedLayout>> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("layout")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Could not load layout preference." };
  }

  return { ok: true, data: parseFeedLayout(data?.layout) };
}

export async function updateUserLayout(
  layout: FeedLayout,
): Promise<ActionResult<FeedLayout>> {
  if (!isFeedLayout(layout)) {
    return validationError("Invalid layout option.");
  }

  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth;

  const { error } = await auth.supabase
    .from("profiles")
    .update({ layout })
    .eq("id", auth.user.id);

  if (error) {
    return { ok: false, error: "Could not save layout preference." };
  }

  revalidateAppPaths();
  return { ok: true, data: layout };
}

export async function getUserLayoutOrDefault(): Promise<FeedLayout> {
  const result = await getUserLayout();
  return result.ok ? result.data : DEFAULT_FEED_LAYOUT;
}
