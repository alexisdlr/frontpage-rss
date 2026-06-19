"use client";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getFeed, updateFeed } from "@/src/actions/feeds";
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

type EditFeedDialogProps = {
  categories: CategoryWithMeta[];
  feed: FeedWithMeta;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

export default function EditFeedDialog({
  feed,
  categories,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditFeedDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [customTitle, setCustomTitle] = useState<string>(
    feed.displayTitle ?? "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    feed.category_id ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  function resetForm() {
    setCustomTitle(feed.displayTitle ?? "");
    setCategoryId(feed.category_id ?? null);
    setError(null);
    setIsEditing(false);
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
  async function handleEdit() {
    if (!feed) return;

    setIsEditing(true);
    setError(null);

    const result = await updateFeed(feed.id, {
      customTitle: customTitle.trim() || undefined,
      categoryId: categoryId ?? undefined,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
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
            Edit the feed display title and category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="feed-title">Display title</Label>
            <Input
              id="feed-title"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              className="min-h-11 bg-background px-3 py-2.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feed-category">Category</Label>
            <Select value={categoryId ?? ""} onValueChange={setCategoryId}>
              <SelectTrigger
                id="feed-category"
                className="min-h-11 w-full bg-background"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isEditing || !feed}
            onClick={() => void handleEdit()}
          >
            {isEditing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Updating…
              </>
            ) : (
              "Update feed"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
