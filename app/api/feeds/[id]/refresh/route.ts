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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let body: {
    url?: string;
    etag?: string;
    lastModified?: string;
    consecutiveFailures?: number;
    lastSuccessAt?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url?.trim();

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "A valid feed URL is required in the request body" },
      { status: 400 },
    );
  }

  const result = await fetchAndParseFeed({
    url,
    etag: body.etag,
    lastModified: body.lastModified,
    consecutiveFailures: body.consecutiveFailures ?? 0,
    lastSuccessAt: body.lastSuccessAt ? new Date(body.lastSuccessAt) : null,
  });

  if (!result.feed && !result.notModified) {
    return NextResponse.json(
      {
        id,
        error: result.health.fetchError ?? "Refresh failed",
        health: result.health,
        finalUrl: result.finalUrl,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    id,
    feed: result.feed,
    notModified: result.notModified ?? false,
    health: result.health,
    etag: result.etag,
    lastModified: result.lastModified,
    finalUrl: result.finalUrl,
  });
}
