"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { addFeed, validateFeedUrl } from "@/actions/feeds";
import { FeedFavicon } from "@/components/items/feed-favicon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory } from "@/actions/categories";

type AddFeedDialogProps = {
  onNavigate?: () => void;
};

export function AddCategoryDialog({ onNavigate }: AddFeedDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  function resetForm() {
    setName("");
    setError(null);
    setIsAdding(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetForm();
    }
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    setIsAdding(true);
    setError(null);

    const result = await createCategory(trimmed);

    setIsAdding(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    handleOpenChange(false);
    onNavigate?.();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full justify-start gap-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Category
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Enter a name for your new category. You can always change the name
            later.
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="categoy-url"
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAdd();
                  }
                }}
                className="min-h-11 flex-1 bg-background px-3 py-2.5"
                aria-invalid={Boolean(error)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isAdding || !name.trim()}
            onClick={() => void handleAdd()}
          >
            {isAdding ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding…
              </>
            ) : (
              "Add Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
