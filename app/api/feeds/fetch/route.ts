import { NextResponse } from "next/server";

import { fetchAndParseFeed } from "@/lib/rss";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim();
  const etag = searchParams.get("etag") ?? undefined;
  const lastModified = searchParams.get("lastModified") ?? undefined;
  const consecutiveFailures = Number(
    searchParams.get("consecutiveFailures") ?? "0",
  );

  if (!url) {
    return NextResponse.json({ error: "url query parameter is required" }, { status: 400 });
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await fetchAndParseFeed({
    url,
    etag,
    lastModified,
    consecutiveFailures: Number.isFinite(consecutiveFailures)
      ? consecutiveFailures
      : 0,
  });

  if (result.notModified) {
    return NextResponse.json({
      notModified: true,
      health: result.health,
      etag: result.etag,
      lastModified: result.lastModified,
      finalUrl: result.finalUrl,
    });
  }

  if (!result.feed) {
    return NextResponse.json(
      {
        error: result.health.fetchError ?? "Failed to fetch feed",
        health: result.health,
        finalUrl: result.finalUrl,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    feed: result.feed,
    health: result.health,
    etag: result.etag,
    lastModified: result.lastModified,
    finalUrl: result.finalUrl,
  });
}
