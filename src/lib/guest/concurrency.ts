/**
 * Run an async task on each item, with at most `concurrency` tasks in flight.
 *
 * Generics (inferred at the call site — you rarely write them explicitly):
 * - T = input item type (`items` array)
 * - R = output type (what `mapper` resolves to per item)
 *
 * @example Guest — GuestFeedDefinition[] → GuestFeedFetchResult[]
 * mapWithConcurrency(feeds, 5, fetchSingleGuestFeed)
 *
 * @example Onboarding — SampleFeedEntry[] → ActionResult<{ id: string }>[]
 * mapWithConcurrency(category.feeds, 4, (feed) => addFeed({ url: feed.feedUrl, ... }))
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}
