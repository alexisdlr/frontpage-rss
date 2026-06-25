"use client";

import { AnimatePresence, motion } from "framer-motion";
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

const formTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const categorySpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
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
    <motion.div
      className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={formTransition}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...formTransition, delay: 0.05 }}
      >
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          Welcome to Frontpage
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Pick the topics you care about and we&apos;ll add curated RSS feeds so
          your dashboard isn&apos;t empty on day one.
        </p>
      </motion.div>

      <motion.div
        className="mt-6 flex flex-wrap items-center justify-between gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.25 }}
      >
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
      </motion.div>

      <motion.ul
        className="mt-4 grid gap-3 sm:grid-cols-2"
        role="list"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => {
          const isSelected = selected.has(category.name);

          return (
            <motion.li key={category.name} variants={categoryVariants} layout>
              <motion.label
                layout
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={categorySpring}
                animate={{
                  scale: isSelected ? 1.01 : 1,
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  isSelected
                    ? "border-accent bg-accent-subtle/40 shadow-sm"
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
              </motion.label>
            </motion.li>
          );
        })}
      </motion.ul>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="onboarding-error"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isImporting ? (
          <motion.p
            key="importing-message"
            className="mt-4 text-center text-sm text-text-secondary"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            Adding feeds… this can take up to a minute while we fetch each
            subscription.
          </motion.p>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
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
      </motion.div>

      <motion.p
        className="mt-4 text-center text-xs text-text-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.25 }}
      >
        Prefer to paste your own URLs? Skip and use Add feed on the dashboard.
      </motion.p>
    </motion.div>
  );
}
