import type { FeedHealth, FeedHealthStatus } from "@/types/rss";

const STALE_THRESHOLD_DAYS = 30;
const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 24 * 60 * 60 * 1000;

export function computeFeedHealth(input: {
  lastSuccessAt?: Date | null;
  lastFetchAt?: Date | null;
  fetchError?: string | null;
  consecutiveFailures?: number;
  latestItemDate?: Date | null;
}): FeedHealth {
  const {
    lastSuccessAt,
    lastFetchAt,
    fetchError,
    consecutiveFailures = 0,
    latestItemDate,
  } = input;

  const referenceDate =
    latestItemDate ?? lastSuccessAt ?? lastFetchAt ?? null;

  let status: FeedHealthStatus = "active";

  if (fetchError) {
    status = "error";
  } else if (referenceDate) {
    const daysSinceUpdate =
      (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate >= STALE_THRESHOLD_DAYS) {
      status = "stale";
    }
  }

  const nextRetryAt =
    fetchError && consecutiveFailures > 0
      ? new Date(Date.now() + calculateBackoffMs(consecutiveFailures))
      : null;

  return {
    status,
    lastSuccessAt: lastSuccessAt ?? null,
    lastFetchAt: lastFetchAt ?? null,
    fetchError: fetchError ?? null,
    nextRetryAt,
    consecutiveFailures,
  };
}

export function calculateBackoffMs(consecutiveFailures: number): number {
  const exponent = Math.min(consecutiveFailures, 10);
  const delay = BASE_BACKOFF_MS * 2 ** (exponent - 1);
  return Math.min(delay, MAX_BACKOFF_MS);
}

export function shouldRetryFeed(health: FeedHealth, now = new Date()): boolean {
  if (!health.fetchError) return true;
  if (!health.nextRetryAt) return true;
  return now >= health.nextRetryAt;
}

export function nextFailureCount(current: number, failed: boolean): number {
  return failed ? current + 1 : 0;
}
