"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { renameCategory } from "@/src/actions/categories";
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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { CategoryWithMeta } from "@/src/types/actions";

type RenameCategoryDialogProps = {
  category: CategoryWithMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed?: (categoryId: string, name: string) => void;
};

export function RenameCategoryDialog({
  category,
  open,
  onOpenChange,
  onRenamed,
}: RenameCategoryDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setError(null);
      setIsSaving(false);
    }
  }, [open, category]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setError(null);
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (!category) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    if (trimmed === category.name) {
      handleOpenChange(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await renameCategory(category.id, trimmed);

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onRenamed?.(category.id, trimmed);
    handleOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rename Category</DialogTitle>
          <DialogDescription>
            Enter a new name for &ldquo;{category?.name}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="category-name">Category name</Label>
            <Input
              id="category-name"
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              className="min-h-11 bg-background px-3 py-2.5"
              aria-invalid={Boolean(error)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || !name.trim()}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
