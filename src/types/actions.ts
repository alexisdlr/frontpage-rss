import type { Database } from "@/src/types/database";

export type DbFeed = Database["public"]["Tables"]["feeds"]["Row"];
export type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
export type DbFeedItem = Database["public"]["Tables"]["feed_items"]["Row"];

export type ActionError = {
  ok: false;
  error: string;
};

export type ActionSuccess<T = void> = T extends void
  ? { ok: true }
  : { ok: true; data: T };

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;

export type ItemCursor = {
  publishedAt: string;
  id: string;
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: ItemCursor | null;
  hasMore: boolean;
};

export type FeedItemSource = {
  id: string;
  customTitle: string | null;
  faviconUrl: string | null;
  siteUrl: string | null;
  categoryId: string | null;
  url: string;
};

export type FeedItemWithMeta = {
  id: string;
  feedId: string;
  guid: string;
  url: string;
  title: string | null;
  description: string | null;
  contentHtml: string | null;
  author: string | null;
  publishedAt: string | null;
  fetchedAt: string;
  isRead: boolean;
  readAt: string | null;
  feed: FeedItemSource;
};

export type FeedWithMeta = DbFeed & {
  unreadCount: number;
  displayTitle: string;
};

export type CategoryWithMeta = DbCategory & {
  unreadCount: number;
};

export type UnreadCounts = {
  total: number;
  uncategorized: number;
  byFeed: Record<string, number>;
  byCategory: Record<string, number>;
};

export type ItemListScope =
  | { type: "all" }
  | { type: "feed"; feedId: string }
  | { type: "category"; categoryId: string }
  | { type: "uncategorized" };

export type DeleteCategoryOptions = {
  reassignToCategoryId: string | null;
};
