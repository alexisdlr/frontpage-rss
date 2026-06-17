export function FeedItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border-subtle" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex gap-3 px-1 py-4">
          <div className="mt-1 size-4 shrink-0 animate-pulse rounded-sm bg-bg-tertiary" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-bg-tertiary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-bg-tertiary" />
            <div className="h-3 w-full animate-pulse rounded bg-bg-tertiary" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FeedItemListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-6 w-32 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-bg-tertiary" />
      </div>
      <FeedItemSkeleton count={8} />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 px-3 py-4" aria-hidden="true">
      <div className="h-4 w-20 animate-pulse rounded bg-bg-tertiary" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-9 animate-pulse rounded-md bg-bg-tertiary"
          />
        ))}
      </div>
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <article className="mx-auto max-w-content animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-3/4 rounded bg-bg-tertiary" />
      <div className="h-4 w-1/2 rounded bg-bg-tertiary" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`h-4 rounded bg-bg-tertiary ${index % 3 === 2 ? "w-5/6" : "w-full"}`}
          />
        ))}
      </div>
    </article>
  );
}
