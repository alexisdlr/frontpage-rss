"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { reorderCategories as persistCategoryOrder } from "@/src/actions/categories";
import { RenameCategoryDialog } from "@/src/components/dashboard/categories/rename-category-dialog";
import { DeleteCategoryDialog } from "@/src/components/dashboard/categories/delete-category-dialog";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "../../ui/dialog";
import { Alert, AlertDescription } from "../../ui/alert";
import { CategoryWithMeta } from "@/src/types/actions";
import { cn } from "@/src/lib/utils";
import { Button } from "../../ui/button";

type EditCategoriesDialogOpenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithMeta[];
  feedCountByCategory?: Record<string, number>;
};

const EditCategoriesDialog = ({
  categories,
  open,
  onOpenChange,
  feedCountByCategory = {},
}: EditCategoriesDialogOpenProps) => {
  const router = useRouter();
  const [internalCategories, setInternalCategories] = useState(categories);
  const [renamingCategory, setRenamingCategory] =
    useState<CategoryWithMeta | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setInternalCategories(categories);
      setError(null);
    }
  }, [open, categories]);

  async function handleDragEnd(
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]>
    >[0],
  ) {
    if (event.canceled) return;

    const previousOrder = internalCategories;
    const nextCategories = move(internalCategories, event);

    if (nextCategories === internalCategories) return;

    setInternalCategories(nextCategories);
    setError(null);

    const result = await persistCategoryOrder(
      nextCategories.map((category) => category.id),
    );

    if (!result.ok) {
      setInternalCategories(previousOrder);
      setError(result.error);
      return;
    }

    router.refresh();
  }

  function handleRenamed(categoryId: string, name: string) {
    setInternalCategories((items) =>
      items.map((item) => (item.id === categoryId ? { ...item, name } : item)),
    );
  }

  function handleDeleted(categoryId: string) {
    setInternalCategories((items) =>
      items.filter((item) => item.id !== categoryId),
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          if (!next) {
            setRenamingCategory(null);
            setDeletingCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Categories</DialogTitle>
            <DialogDescription>
              Drag to reorder, rename, or delete categories.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DragDropProvider onDragEnd={(event) => void handleDragEnd(event)}>
            <ul className="space-y-2">
              {internalCategories.map((category, index) => (
                <Sortable
                  key={category.id}
                  category={category}
                  index={index}
                  onRename={() => setRenamingCategory(category)}
                  onDelete={() => setDeletingCategory(category)}
                />
              ))}
            </ul>
          </DragDropProvider>
        </DialogContent>
      </Dialog>

      <RenameCategoryDialog
        category={renamingCategory}
        open={renamingCategory !== null}
        onOpenChange={(next) => {
          if (!next) setRenamingCategory(null);
        }}
        onRenamed={handleRenamed}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        categories={internalCategories}
        feedCount={
          deletingCategory ? (feedCountByCategory[deletingCategory.id] ?? 0) : 0
        }
        open={deletingCategory !== null}
        onOpenChange={(next) => {
          if (!next) setDeletingCategory(null);
        }}
        onDeleted={handleDeleted}
      />
    </>
  );
};

function Sortable({
  category,
  index,
  onRename,
  onDelete,
}: {
  category: CategoryWithMeta;
  index: number;
  onRename: () => void;
  onDelete: () => void;
}) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const { ref, isDragging } = useSortable({
    id: category.id,
    index,
    handle: handleRef,
  });

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2",
        isDragging && "opacity-60",
      )}
    >
      <button
        type="button"
        ref={handleRef}
        className="cursor-grab rounded p-1 text-text-tertiary active:cursor-grabbing"
        aria-label={`Reorder ${category.name}`}
      >
        <GripVertical className="size-4 shrink-0" aria-hidden="true" />
      </button>
      <span className="min-w-0 flex-1 truncate">{category.name}</span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          className="cursor-pointer"
          variant="outline"
          size="sm"
          aria-label={`Rename ${category.name}`}
          onClick={onRename}
        >
          <Pencil className="size-4" aria-hidden="true" />
          Rename
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </li>
  );
}

export default EditCategoriesDialog;
