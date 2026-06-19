"use client";

import { useRouter } from "next/navigation";
import { CheckCheck, PencilIcon, TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";

import {
  markAllReadGlobally,
  markAllReadInCategory,
  markAllReadInFeed,
  markAllReadUncategorized,
} from "@/src/actions/read-state";
import { Button } from "@/src/components/ui/button";

import type {
  CategoryWithMeta,
  FeedWithMeta,
  ItemListScope,
} from "@/src/types/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EditFeedDialog from "../dashboard/feeds/edit-feed-dialog";
import DeleteFeedDialog from "../dashboard/feeds/delete-feed-dialog";
import { motion } from "framer-motion";

type FeedListHeaderProps = {
  categories: CategoryWithMeta[];
  scope: ItemListScope;
  title: string;
  feed?: FeedWithMeta;
  unreadCount: number;
};

export function FeedListHeader({
  categories,
  feed,
  scope,
  title,
  unreadCount,
}: FeedListHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editFeedOpen, setEditFeedOpen] = useState(false);
  const [deleteFeedOpen, setDeleteFeedOpen] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 md:mt-16 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
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

      {unreadCount > 0 || (scope.type === "feed" && feed) ? (
        <div className="relative flex items-center gap-2">
          <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-10 cursor-pointer"
                disabled={isPending}
                aria-expanded={open}
                aria-haspopup="menu"
              >
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" z-20 mt-1 rounded-md border border-border bg-surface p-1 shadow-md">
              {unreadCount > 0 ? (
                <DropdownMenuItem
                  onClick={() => void handleMarkAllRead()}
                  className="cursor-pointer transition-all duration-300"
                >
                  <CheckCheck className="size-4" aria-hidden="true" />
                  Mark all as read
                </DropdownMenuItem>
              ) : null}
              {scope.type === "feed" && feed ? (
                <>
                  <DropdownMenuItem
                    onClick={() => setEditFeedOpen(true)}
                    className="cursor-pointer transition-all duration-300"
                  >
                    <PencilIcon className="size-4" aria-hidden="true" />
                    Edit feed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteFeedOpen(true)}
                    variant="destructive"
                    className="cursor-pointer transition-all duration-300"
                  >
                    <TrashIcon className="size-4" aria-hidden="true" />
                    Delete feed
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      {scope.type === "feed" && feed ? (
        <>
          <EditFeedDialog
            open={editFeedOpen}
            onOpenChange={(next) => setEditFeedOpen(next)}
            feed={feed}
            categories={categories}
          />
          <DeleteFeedDialog
            open={deleteFeedOpen}
            onOpenChange={(next) => setDeleteFeedOpen(next)}
            feed={feed}
          />
        </>
      ) : null}
    </motion.div>
  );
}
