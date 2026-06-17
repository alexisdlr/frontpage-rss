"use client";

import { useRouter } from "next/navigation";
import { CheckCheck, ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";

import {
  markAllReadGlobally,
  markAllReadInCategory,
  markAllReadInFeed,
  markAllReadUncategorized,
} from "@/actions/read-state";
import { Button } from "@/components/ui/button";

import type { ItemListScope } from "@/types/actions";

type FeedListHeaderProps = {
  scope: ItemListScope;
  title: string;
  unreadCount: number;
};

export function FeedListHeader({
  scope,
  title,
  unreadCount,
}: FeedListHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleMarkAllRead() {
    startTransition(async () => {
      let result;

      switch (scope.type) {
        case "feed":
          result = await markAllReadInFeed(scope.feedId);
          break;
        case "category":
          result = await markAllReadInCategory(scope.categoryId);
          break;
        case "uncategorized":
          result = await markAllReadUncategorized();
          break;
        default:
          result = await markAllReadGlobally();
      }

      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mb-6 md:mt-16 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {unreadCount > 0 ? (
            <span>{unreadCount} unread</span>
          ) : (
            <span>All caught up</span>
          )}
        </p>
      </div>

      {unreadCount > 0 ? (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10"
            disabled={isPending}
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((value) => !value)}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all read
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>

          {open ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-border bg-surface p-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full rounded-sm px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                  disabled={isPending}
                  onClick={() => void handleMarkAllRead()}
                >
                  Mark all in {title.toLowerCase()} as read
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
