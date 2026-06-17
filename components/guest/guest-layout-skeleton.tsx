import { SidebarSkeleton, FeedItemListSkeleton } from "@/components/items/skeletons";

export function GuestLayoutSkeleton() {
  return (
    <div className="flex min-h-dvh bg-bg-primary">
      <div className="hidden w-sidebar shrink-0 border-r border-border md:block">
        <SidebarSkeleton />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-feed px-4 py-6 sm:px-6">
          <div className="mb-6 h-20 animate-pulse rounded-lg bg-bg-tertiary" />
          <FeedItemListSkeleton />
        </div>
      </div>
    </div>
  );
}
