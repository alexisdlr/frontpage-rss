"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteFeed } from "@/src/actions/feeds";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { FeedWithMeta } from "@/src/types/actions";

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
  const categoryId = feed?.category_id;
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
    router.push(`/category/${categoryId}`);
  }

  if (!feed) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold ">
            Delete {feed.displayTitle} feed
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to delete this feed? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
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
            variant="destructive"
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
