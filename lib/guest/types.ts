import type {
  CategoryWithMeta,
  FeedItemWithMeta,
  FeedWithMeta,
  UnreadCounts,
} from "@/types/actions";

export type GuestFeedFetchResult = {
  feedId: string;
  ok: boolean;
  error?: string;
  items: FeedItemWithMeta[];
  feedMeta: {
    title: string;
    description: string | null;
    siteUrl: string | null;
    faviconUrl: string | null;
    url: string;
    categoryId: string;
  };
};

export type GuestFeedData = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  items: FeedItemWithMeta[];
  unreadCounts: UnreadCounts;
  fetchedAt: string;
  feedErrors: Record<string, string>;
};
