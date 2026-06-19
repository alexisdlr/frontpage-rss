"use client";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteFeed, getFeed, updateFeed } from "@/src/actions/feeds";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { CategoryWithMeta, FeedWithMeta } from "@/src/types/actions";

type DeleteFeedDialogProps = {
  feed: FeedWithMeta;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function DeleteFeedDialogProps({
  feed,

  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteFeedDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function resetForm() {
    setIsDeleting(false);
  }

  function handleOpenChange(next: boolean) {
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    controlledOnOpenChange?.(next);
    if (!next) {
      resetForm();
    }
  }
  async function handleDelete() {
    if (!feed) return;

    setIsDeleting(true);
    setError(null);

    const result = await deleteFeed(feed.id);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsDeleting(false);
    handleOpenChange(false);
    router.refresh();
  }

  if (!feed) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {feed.custom_title} feed</DialogTitle>
          <DialogDescription>
            Edit the feed URL. We&apos;ll validate it before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="feed-url">Feed URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row"></div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isDeleting || !feed}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Delete feed"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
