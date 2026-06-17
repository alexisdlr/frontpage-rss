import { readFile } from "fs/promises";
import path from "path";

import { guestCategoryId, guestFeedId } from "@/src/lib/guest/ids";

export type SampleFeedEntry = {
  title: string;
  feedUrl: string;
  siteUrl: string;
  description: string;
  format?: string;
  notes?: string;
};

export type SampleCategory = {
  name: string;
  feeds: SampleFeedEntry[];
};

export type SampleFeedsDocument = {
  title: string;
  description: string;
  categories: SampleCategory[];
};

export type GuestFeedDefinition = SampleFeedEntry & {
  id: string;
  categoryId: string;
  categoryName: string;
};

let cachedDocument: SampleFeedsDocument | null = null;

export async function loadSampleFeedsDocument(): Promise<SampleFeedsDocument> {
  if (cachedDocument) return cachedDocument;

  const filePath = path.join(process.cwd(), "src/data", "sample-feeds.json");
  const raw = await readFile(filePath, "utf8");
  cachedDocument = JSON.parse(raw) as SampleFeedsDocument;
  return cachedDocument;
}

export async function getGuestFeedDefinitions(): Promise<
  GuestFeedDefinition[]
> {
  const document = await loadSampleFeedsDocument();
  const definitions: GuestFeedDefinition[] = [];

  for (const category of document.categories) {
    const categoryId = guestCategoryId(category.name);

    for (const feed of category.feeds) {
      definitions.push({
        ...feed,
        id: guestFeedId(feed.feedUrl),
        categoryId,
        categoryName: category.name,
      });
    }
  }

  return definitions;
}

export async function getGuestCategoriesFromSample() {
  const document = await loadSampleFeedsDocument();

  return document.categories.map((category) => ({
    id: guestCategoryId(category.name),
    name: category.name,
    sortOrder: document.categories.indexOf(category),
  }));
}
