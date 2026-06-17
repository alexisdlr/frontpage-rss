"use client";

import { notFound } from "next/navigation";

import { GuestBrowseView } from "@/components/guest/guest-browse-view";
import { useGuest } from "@/components/guest/guest-provider";

type GuestFeedContentProps = {
  feedId: string;
};

export function GuestFeedContent({ feedId }: GuestFeedContentProps) {
  const { feeds } = useGuest();
  const feed = feeds.find((entry) => entry.id === feedId);

  if (!feed) {
    notFound();
  }

  return (
    <GuestBrowseView
      scope={{ type: "feed", feedId: feed.id }}
      title={feed.displayTitle}
    />
  );
}
