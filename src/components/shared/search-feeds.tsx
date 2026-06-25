"use client";
import React, { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startNavigationProgress } from "@/src/lib/navigation-progress";

const SearchFeedsInput = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [search, setSearch] = useState(q || "");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim() === "") return;

    startTransition(() => {
      startNavigationProgress({ showOverlay: false }); // opcional
      router.push(`/search?q=${encodeURIComponent(search)}`);
    });
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <div className="relative w-64">
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
};

export default SearchFeedsInput;
