import type { FetchFeedOptions, FetchFeedResult } from "@/src/types/rss";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_USER_AGENT =
  "Frontpage/1.0 (+https://frontpage.app; RSS feed reader)";

export async function fetchFeed(
  options: FetchFeedOptions,
): Promise<FetchFeedResult> {
  const {
    url,
    etag,
    lastModified,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    userAgent = DEFAULT_USER_AGENT,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      "User-Agent": userAgent,
    };

    if (etag) {
      headers["If-None-Match"] = etag;
    }
    if (lastModified) {
      headers["If-Modified-Since"] = lastModified;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });

    const finalUrl = response.url || url;

    if (response.status === 304) {
      return {
        ok: true,
        status: 304,
        body: "",
        finalUrl,
        notModified: true,
        etag: response.headers.get("etag") ?? etag ?? undefined,
        lastModified:
          response.headers.get("last-modified") ?? lastModified ?? undefined,
        contentType: response.headers.get("content-type") ?? undefined,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        body: "",
        finalUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      ok: true,
      status: response.status,
      body: buffer.toString("binary"),
      rawBuffer: buffer,
      finalUrl,
      etag: response.headers.get("etag") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined,
      contentType: response.headers.get("content-type") ?? undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        body: "",
        finalUrl: url,
        error: `Request timed out after ${timeoutMs / 1000}s`,
      };
    }

    return {
      ok: false,
      status: 0,
      body: "",
      finalUrl: url,
      error: error instanceof Error ? error.message : "Network request failed",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
