import { NextResponse } from "next/server";

import { fetchAndParseFeed } from "@/src/lib/rss";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: { url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await fetchAndParseFeed({ url });

  if (!result.feed) {
    return NextResponse.json(
      {
        valid: false,
        error: result.health.fetchError ?? "Could not parse feed",
        health: result.health,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    valid: true,
    feed: {
      title: result.feed.meta.title,
      description: result.feed.meta.description,
      siteUrl: result.feed.meta.siteUrl,
      faviconUrl: result.feed.meta.faviconUrl,
      format: result.feed.meta.format,
      itemCount: result.feed.items.length,
    },
    health: result.health,
    finalUrl: result.finalUrl,
  });
}
