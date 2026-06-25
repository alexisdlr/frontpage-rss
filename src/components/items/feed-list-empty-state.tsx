"use client";

import Link from "next/link";

import { AddFeedDialog } from "@/src/components/dashboard/feeds/add-feed-dialog";
import { Button } from "@/src/components/ui/button";

import type { CategoryWithMeta } from "@/src/types/actions";
import { TextSearch } from "lucide-react";

type FeedListEmptyStateProps = {
  categories: CategoryWithMeta[];
};

export function FeedListEmptyState({ categories }: FeedListEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-lg font-medium text-text-primary">No items yet</p>
      <p className="mt-2 text-sm text-text-secondary">
        Add RSS feeds to start seeing articles here, or pick from our curated
        starter packs.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="outline" asChild>
          <Link href="/onboarding">
            <TextSearch className="size-4" aria-hidden="true" />
            Browse starter feeds
          </Link>
        </Button>
        <AddFeedDialog categories={categories} showTrigger />
      </div>
    </div>
  );
}
