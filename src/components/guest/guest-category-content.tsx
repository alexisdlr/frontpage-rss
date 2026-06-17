"use client";

import { notFound } from "next/navigation";

import { GuestBrowseView } from "@/src/components/guest/guest-browse-view";
import { useGuest } from "@/src/components/guest/guest-provider";

type GuestCategoryContentProps = {
  categoryId: string;
};

export function GuestCategoryContent({
  categoryId,
}: GuestCategoryContentProps) {
  const { categories } = useGuest();

  if (categoryId === "uncategorized") {
    return (
      <GuestBrowseView
        scope={{ type: "uncategorized" }}
        title="Uncategorized"
      />
    );
  }

  const category = categories.find((entry) => entry.id === categoryId);
  if (!category) {
    notFound();
  }

  return (
    <GuestBrowseView
      scope={{ type: "category", categoryId }}
      title={category.name}
    />
  );
}
