import { createHash } from "crypto";
import he from "he";

import type { NormalizedFeedItem } from "@/types/rss";

function decodeEntities(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return he.decode(value.trim());
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const decoded = decodeEntities(value);
  if (!decoded) return undefined;
  return decoded.includes("<") ? stripHtml(decoded) : decoded;
}

export function normalizeHtml(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return decodeEntities(value);
}

export function itemGuid(
  guid: string | undefined,
  link: string | undefined,
  title: string | undefined,
): string {
  if (guid?.trim()) {
    return guid.trim();
  }
  if (link?.trim()) {
    return hashString(link.trim());
  }
  if (title?.trim()) {
    return hashString(title.trim());
  }
  return hashString(`${link ?? ""}:${title ?? ""}:${Date.now()}`);
}

function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

const DATE_FORMATS = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  /^[A-Za-z]{3}, \d{1,2} [A-Za-z]{3} \d{4}/,
  /^\d{4}-\d{2}-\d{2}/,
];

export function normalizeDate(
  value: string | Date | undefined | null,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  for (const pattern of DATE_FORMATS) {
    if (pattern.test(trimmed)) {
      const retry = new Date(trimmed.replace(/\s*\([^)]*\)\s*/g, ""));
      if (!Number.isNaN(retry.getTime())) {
        return retry;
      }
    }
  }

  return null;
}

export interface RawFeedItem {
  guid?: string;
  id?: string;
  link?: string;
  title?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  description?: string;
  "content:encoded"?: string;
  creator?: string;
  author?: string;
  pubDate?: string;
  isoDate?: string;
  published?: string;
  updated?: string;
}

export function normalizeItem(raw: RawFeedItem): NormalizedFeedItem {
  const title =
    normalizeText(raw.title) ||
    normalizeText(raw.description)?.slice(0, 120) ||
    "Untitled";

  const contentHtml =
    normalizeHtml(raw["content:encoded"]) ||
    normalizeHtml(raw.content) ||
    undefined;

  const description =
    normalizeText(raw.contentSnippet) ||
    normalizeText(raw.summary) ||
    normalizeText(raw.description) ||
    (contentHtml ? stripHtml(contentHtml).slice(0, 280) : undefined);

  const publishedAt =
    normalizeDate(raw.isoDate) ||
    normalizeDate(raw.pubDate) ||
    normalizeDate(raw.published) ||
    normalizeDate(raw.updated);

  return {
    guid: itemGuid(raw.guid ?? raw.id, raw.link, raw.title),
    url: raw.link?.trim() || undefined,
    title,
    description,
    contentHtml,
    author:
      normalizeText(raw.creator) ||
      normalizeText(typeof raw.author === "string" ? raw.author : undefined),
    publishedAt,
  };
}

export function deduplicateItems(
  items: NormalizedFeedItem[],
): NormalizedFeedItem[] {
  const seen = new Set<string>();
  const result: NormalizedFeedItem[] = [];

  for (const item of items) {
    const key = item.guid || (item.url ? hashString(item.url) : item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}
