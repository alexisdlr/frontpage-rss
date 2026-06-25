"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  importStarterFeeds,
  skipOnboarding,
  type StarterCategory,
} from "@/src/actions/onboarding";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type OnboardingFormProps = {
  categories: StarterCategory[];
};

export function OnboardingForm({ categories }: OnboardingFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(categories.map((category) => category.name)),
  );
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const selectedCount = selected.size;
  const feedCount = categories
    .filter((category) => selected.has(category.name))
    .reduce((total, category) => total + category.feedCount, 0);

  function toggleCategory(name: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(categories.map((category) => category.name)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleImport() {
    if (selectedCount === 0) {
      setError("Select at least one category.");
      return;
    }

    setError(null);
    setIsImporting(true);

    const result = await importStarterFeeds(Array.from(selected));

    setIsImporting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSkip() {
    setIsSkipping(true);
    await skipOnboarding();
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          Welcome to Frontpage
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Pick the topics you care about and we&apos;ll add curated RSS feeds so
          your dashboard isn&apos;t empty on day one.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">
          {selectedCount} {selectedCount === 1 ? "category" : "categories"} ·{" "}
          {feedCount} {feedCount === 1 ? "feed" : "feeds"}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
            Select all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="list">
        {categories.map((category) => {
          const isSelected = selected.has(category.name);

          return (
            <li key={category.name}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  isSelected
                    ? "border-accent bg-accent-subtle/40"
                    : "border-border bg-bg-primary hover:bg-bg-tertiary/50",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-accent"
                  checked={isSelected}
                  onChange={() => toggleCategory(category.name)}
                />
                <span className="min-w-0">
                  <span className="block font-medium text-text-primary">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-sm text-text-secondary">
                    {category.feedCount}{" "}
                    {category.feedCount === 1 ? "feed" : "feeds"}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {isImporting ? (
        <p className="mt-4 text-center text-sm text-text-secondary">
          Adding feeds… this can take up to a minute while we fetch each
          subscription.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          size="lg"
          className="sm:min-w-48"
          disabled={isImporting || isSkipping || selectedCount === 0}
          onClick={handleImport}
        >
          {isImporting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding feeds…
            </>
          ) : (
            `Add ${feedCount} feeds`
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={isImporting || isSkipping}
          onClick={handleSkip}
        >
          {isSkipping ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Skipping…
            </>
          ) : (
            "Skip for now"
          )}
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-text-tertiary">
        Prefer to paste your own URLs? Skip and use Add feed on the dashboard.
      </p>
    </div>
  );
}
