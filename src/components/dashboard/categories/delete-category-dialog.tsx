"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { deleteCategory } from "@/src/actions/categories";
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
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { CategoryWithMeta } from "@/src/types/actions";

const UNCATEGORIZED_VALUE = "uncategorized";

type DeleteCategoryDialogProps = {
  category: CategoryWithMeta | null;
  categories: CategoryWithMeta[];
  feedCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (categoryId: string) => void;
};

export function DeleteCategoryDialog({
  category,
  categories,
  feedCount,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [reassignTo, setReassignTo] = useState(UNCATEGORIZED_VALUE);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const otherCategories = useMemo(
    () => categories.filter((item) => item.id !== category?.id),
    [categories, category?.id],
  );

  useEffect(() => {
    if (!open || !category) return;

    setError(null);
    setIsDeleting(false);
    setReassignTo(
      otherCategories.length > 0
        ? otherCategories[0].id
        : UNCATEGORIZED_VALUE,
    );
  }, [open, category, otherCategories]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setError(null);
      setIsDeleting(false);
    }
  }

  async function handleDelete() {
    if (!category) return;

    setIsDeleting(true);
    setError(null);

    const reassignToCategoryId =
      reassignTo === UNCATEGORIZED_VALUE ? null : reassignTo;

    const result = await deleteCategory(category.id, {
      reassignToCategoryId,
    });

    setIsDeleting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onDeleted?.(category.id);
    handleOpenChange(false);

    if (pathname === `/category/${category.id}`) {
      router.push("/dashboard");
    } else {
      router.refresh();
    }
  }

  const feedLabel =
    feedCount === 1 ? "1 feed" : `${feedCount} feeds`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete {category?.name}</DialogTitle>
          <DialogDescription>
            {feedCount > 0
              ? `This category contains ${feedLabel}. Choose where to move them before deleting.`
              : "This category has no feeds. This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {feedCount > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="reassign-category">Move feeds to</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger
                  id="reassign-category"
                  className="min-h-11 w-full bg-background"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED_VALUE}>
                    Uncategorized
                  </SelectItem>
                  {otherCategories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            disabled={isDeleting || !category}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Delete category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
