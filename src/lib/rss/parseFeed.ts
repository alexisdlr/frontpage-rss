import Parser from "rss-parser";

import { decodeFeedBody } from "./decodeBody";
import {
  deduplicateItems,
  normalizeItem,
  type RawFeedItem,
} from "./normalizeItem";

import type {
  FeedFormat,
  NormalizedFeedMeta,
  ParsedFeed,
  ParseFeedError,
} from "@/src/types/rss";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "content:encoded"],
      ["dc:creator", "creator"],
    ],
  },
  timeout: 10_000,
});

function detectFormat(xml: string): FeedFormat {
  if (
    /<feed[\s>]/i.test(xml) &&
    /xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/i.test(xml)
  ) {
    return "atom";
  }
  if (/<rdf:RDF/i.test(xml) || /xmlns:rdf=/i.test(xml)) {
    return "rdf";
  }
  return "rss";
}

function resolveSiteUrl(
  feed: Parser.Output<{ image?: { url?: string }; link?: string }>,
): string | undefined {
  if (typeof feed.link === "string" && feed.link) {
    return feed.link;
  }
  return undefined;
}

function resolveFavicon(feedUrl: string, siteUrl?: string): string | undefined {
  try {
    const base = siteUrl ? new URL(siteUrl) : new URL(feedUrl);
    return `${base.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

export async function parseFeedXml(
  rawBody: string | Buffer,
  feedUrl: string,
  contentType?: string,
): Promise<ParsedFeed> {
  const xml = decodeFeedBody(rawBody, contentType);
  const format = detectFormat(xml);

  let parsed: Parser.Output<RawFeedItem>;
  try {
    parsed = (await parser.parseString(xml)) as Parser.Output<RawFeedItem>;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse feed XML";
    throw {
      message,
      partial: tryPartialParse(xml, feedUrl, format),
    } satisfies ParseFeedError;
  }

  const siteUrl = resolveSiteUrl(parsed);
  const meta: NormalizedFeedMeta = {
    title: parsed.title?.trim() || "Untitled Feed",
    description: parsed.description?.trim(),
    siteUrl,
    faviconUrl: parsed.image?.url || resolveFavicon(feedUrl, siteUrl),
    format,
  };

  const items = deduplicateItems(
    (parsed.items ?? []).map((item) => normalizeItem(item as RawFeedItem)),
  );

  return { meta, items };
}

function tryPartialParse(
  xml: string,
  feedUrl: string,
  format: FeedFormat,
): ParsedFeed | undefined {
  try {
    const titleMatch = xml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) return undefined;
    return {
      meta: {
        title: titleMatch[1].trim(),
        siteUrl: feedUrl,
        format,
      },
      items: [],
    };
  } catch {
    return undefined;
  }
}

export function isParseFeedError(error: unknown): error is ParseFeedError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ParseFeedError).message === "string"
  );
}
