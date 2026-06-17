import type { NormalizedFeedItem } from "@/src/types/rss";
import type { TypedSupabaseClient } from "@/src/actions/utils";

export async function upsertFeedItems(
  supabase: TypedSupabaseClient,
  feedId: string,
  items: NormalizedFeedItem[],
): Promise<{ inserted: number; error?: string }> {
  if (items.length === 0) {
    return { inserted: 0 };
  }

  const rows = items.map((item) => ({
    feed_id: feedId,
    guid: item.guid,
    url: item.url?.trim() || item.guid,
    title: item.title || null,
    description: item.description ?? null,
    content_html: item.contentHtml ?? null,
    author: item.author ?? null,
    published_at: item.publishedAt?.toISOString() ?? null,
  }));

  const batchSize = 100;
  let inserted = 0;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from("feed_items").upsert(batch, {
      onConflict: "feed_id,guid",
      ignoreDuplicates: false,
    });

    if (error) {
      return { inserted, error: error.message };
    }

    inserted += batch.length;
  }

  return { inserted };
}
