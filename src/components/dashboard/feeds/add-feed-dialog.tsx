"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { addFeed, validateFeedUrl } from "@/src/actions/feeds";
import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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

import type { CategoryWithMeta } from "@/src/types/actions";

type FeedPreview = {
  title: string;
  description?: string;
  siteUrl?: string;
  faviconUrl?: string;
  itemCount: number;
};

type AddFeedDialogProps = {
  categories: CategoryWithMeta[];
  onNavigate?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

export function AddFeedDialog({
  categories,
  onNavigate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: AddFeedDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [url, setUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [preview, setPreview] = useState<FeedPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  function resetForm() {
    setUrl("");
    setCustomTitle("");
    setCategoryId("none");
    setPreview(null);
    setError(null);
    setIsValidating(false);
    setIsAdding(false);
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

  function handleUrlChange(next: string) {
    setUrl(next);
    if (preview) {
      setPreview(null);
    }
    if (error) {
      setError(null);
    }
  }

  async function handleValidate() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Feed URL is required.");
      setPreview(null);
      return;
    }

    setIsValidating(true);
    setError(null);
    setPreview(null);

    const result = await validateFeedUrl(trimmed);

    setIsValidating(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPreview(result.data);
    setCustomTitle((current) => current.trim() || result.data.title);
  }

  async function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Feed URL is required.");
      return;
    }

    if (!preview) {
      setError("Validate the feed URL before adding.");
      return;
    }

    setIsAdding(true);
    setError(null);

    const result = await addFeed({
      url: trimmed,
      categoryId: categoryId === "none" ? null : categoryId,
      customTitle: customTitle.trim() || undefined,
    });

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
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full justify-start gap-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add feed
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add feed</DialogTitle>
          <DialogDescription>
            Paste an RSS or Atom feed URL. We&apos;ll validate it before saving.
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
                id="feed-url"
                type="url"
                inputMode="url"
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(event) => handleUrlChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleValidate();
                  }
                }}
                className="min-h-11 flex-1 bg-background px-3 py-2.5"
                aria-invalid={Boolean(error && !preview)}
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 shrink-0"
                disabled={isValidating || isAdding || !url.trim()}
                onClick={() => void handleValidate()}
              >
                {isValidating ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Validating…
                  </>
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
          </div>

          {preview ? (
            <Card size="sm" className="py-4">
              <CardHeader className="pb-0">
                <div className="flex items-start gap-3">
                  <FeedFavicon
                    url={preview.faviconUrl ?? null}
                    title={preview.title}
                    size="md"
                  />
                  <div className="min-w-0 space-y-1">
                    <CardTitle>{preview.title}</CardTitle>
                    {preview.description ? (
                      <CardDescription className="line-clamp-2">
                        {preview.description}
                      </CardDescription>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 text-xs text-muted-foreground">
                {preview.itemCount}{" "}
                {preview.itemCount === 1 ? "article" : "articles"} found
                {preview.siteUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={preview.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Visit site
                    </a>
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {preview ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="feed-title">Display title</Label>
                <Input
                  id="feed-title"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder={preview.title}
                  className="min-h-11 bg-background px-3 py-2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feed-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
            </>
          ) : null}
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
            disabled={!preview || isAdding || isValidating}
            onClick={() => void handleAdd()}
          >
            {isAdding ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding…
              </>
            ) : (
              "Add feed"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
