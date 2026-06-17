"use client";

import { useGuest } from "@/src/components/guest/guest-provider";
import { GuestItemList } from "@/src/components/guest/guest-item-list";

import type { ItemListScope } from "@/src/types/actions";

type GuestBrowseViewProps = {
  scope: ItemListScope;
  title: string;
};

export function GuestBrowseView({ scope, title }: GuestBrowseViewProps) {
  const { unreadCounts } = useGuest();

  const unreadCount =
    scope.type === "feed"
      ? (unreadCounts.byFeed[scope.feedId] ?? 0)
      : scope.type === "category"
        ? (unreadCounts.byCategory[scope.categoryId] ?? 0)
        : scope.type === "uncategorized"
          ? unreadCounts.uncategorized
          : unreadCounts.total;

  return (
    <GuestItemList scope={scope} title={title} unreadCount={unreadCount} />
  );
}
