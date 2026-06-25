"use client";

import { AddFeedDialog } from "@/src/components/dashboard/feeds/add-feed-dialog";

import type { CategoryWithMeta } from "@/src/types/actions";

type FeedListEmptyStateProps = {
  categories: CategoryWithMeta[];
};

export function FeedListEmptyState({ categories }: FeedListEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-lg font-medium text-text-primary">No items yet</p>
      <p className="mt-2 text-sm text-text-secondary">
        Add your first RSS feed to start seeing articles here.
      </p>
      <div className="mt-6 flex justify-center">
        <AddFeedDialog categories={categories} showTrigger />
      </div>
    </div>
  );
}
