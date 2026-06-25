"use client";

import { SearchIcon } from "lucide-react";

import { Suspense, useEffect, useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { startNavigationProgress } from "@/src/lib/navigation-progress";

import { Input } from "../ui/input";

function SearchFeedsInputInner() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q");

  const [search, setSearch] = useState(q ?? "");

  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearch(q ?? "");
  }, [q]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const term = search.trim();

    if (!term) return;

    startTransition(() => {
      startNavigationProgress({ showOverlay: false });

      router.push(`/search?q=${encodeURIComponent(term)}`);
    });
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <div className="relative w-full md:w-64">
        <Input
          type="search"
          placeholder="Search articles..."
          value={search}
          aria-label="Search articles"
          disabled={isPending}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />

        <SearchIcon
          aria-hidden="true"
          className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </form>
  );
}

function SearchFeedsInputFallback() {
  return (
    <div
      className="h-9 w-full animate-pulse rounded-md bg-bg-tertiary md:w-64"
      aria-hidden="true"
    />
  );
}

export function SearchFeedsInput() {
  return (
    <Suspense fallback={<SearchFeedsInputFallback />}>
      <SearchFeedsInputInner />
    </Suspense>
  );
}

export default SearchFeedsInput;
