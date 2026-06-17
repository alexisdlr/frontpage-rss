"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { GUEST_READ_STATE_KEY } from "@/src/lib/guest/constants";
import { paginateGuestItems } from "@/src/lib/guest/pagination";
import {
  filterGuestItemsByScope,
  getGuestFeedIdsForScope,
} from "@/src/lib/guest/scopes";
import {
  applyGuestReadState,
  computeGuestUnreadCounts,
  getUnreadGuestItemIds,
  type GuestReadStateMap,
} from "@/src/lib/guest/unread";
import type { GuestFeedData } from "@/src/lib/guest/types";

import type {
  CategoryWithMeta,
  FeedItemWithMeta,
  FeedWithMeta,
  ItemCursor,
  ItemListScope,
  PaginatedResult,
  UnreadCounts,
} from "@/src/types/actions";

type GuestContextValue = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  feedErrors: Record<string, string>;
  fetchedAt: string;
  unreadCounts: UnreadCounts;
  getItemsForScope: (scope: ItemListScope) => FeedItemWithMeta[];
  paginateScope: (
    scope: ItemListScope,
    input?: { cursor?: ItemCursor; limit?: number },
  ) => PaginatedResult<FeedItemWithMeta>;
  getItemById: (itemId: string) => FeedItemWithMeta | null;
  getAdjacentItems: (
    itemId: string,
    scope: ItemListScope,
  ) => { previous: FeedItemWithMeta | null; next: FeedItemWithMeta | null };
  markItemRead: (itemId: string) => void;
  setItemReadState: (itemId: string, isRead: boolean) => void;
  markAllReadInScope: (scope: ItemListScope) => void;
  isHydrated: boolean;
};

const GuestContext = createContext<GuestContextValue | null>(null);

function readStoredState(): GuestReadStateMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(GUEST_READ_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as GuestReadStateMap;
  } catch {
    return {};
  }
}

function writeStoredState(state: GuestReadStateMap) {
  window.sessionStorage.setItem(GUEST_READ_STATE_KEY, JSON.stringify(state));
}

type GuestProviderProps = {
  initialData: GuestFeedData;
  children: ReactNode;
};

export function GuestProvider({ initialData, children }: GuestProviderProps) {
  const [readState, setReadState] = useState<GuestReadStateMap>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setReadState(readStoredState());
    setIsHydrated(true);
  }, []);

  const itemsWithReadState = useMemo(
    () => applyGuestReadState(initialData.items, readState),
    [initialData.items, readState],
  );

  const unreadCounts = useMemo(
    () => computeGuestUnreadCounts(initialData.items, readState),
    [initialData.items, readState],
  );

  const categories = useMemo(
    () =>
      initialData.categories.map((category) => ({
        ...category,
        unreadCount: unreadCounts.byCategory[category.id] ?? 0,
      })),
    [initialData.categories, unreadCounts.byCategory],
  );

  const feeds = useMemo(
    () =>
      initialData.feeds.map((feed) => ({
        ...feed,
        unreadCount: unreadCounts.byFeed[feed.id] ?? 0,
      })),
    [initialData.feeds, unreadCounts.byFeed],
  );

  const updateReadState = useCallback((itemIds: string[], isRead: boolean) => {
    setReadState((current) => {
      const next = { ...current };
      const readAt = isRead ? new Date().toISOString() : null;

      for (const itemId of itemIds) {
        next[itemId] = { isRead, readAt };
      }

      writeStoredState(next);
      return next;
    });
  }, []);

  const getItemsForScope = useCallback(
    (scope: ItemListScope) =>
      filterGuestItemsByScope(itemsWithReadState, scope),
    [itemsWithReadState],
  );

  const paginateScope = useCallback(
    (scope: ItemListScope, input?: { cursor?: ItemCursor; limit?: number }) =>
      paginateGuestItems(getItemsForScope(scope), input),
    [getItemsForScope],
  );

  const getItemById = useCallback(
    (itemId: string) =>
      itemsWithReadState.find((item) => item.id === itemId) ?? null,
    [itemsWithReadState],
  );

  const getAdjacentItems = useCallback(
    (itemId: string, scope: ItemListScope) => {
      const scopedItems = getItemsForScope(scope);
      const index = scopedItems.findIndex((item) => item.id === itemId);

      if (index === -1) {
        return { previous: null, next: null };
      }

      return {
        previous: index > 0 ? scopedItems[index - 1] : null,
        next: index < scopedItems.length - 1 ? scopedItems[index + 1] : null,
      };
    },
    [getItemsForScope],
  );

  const markItemRead = useCallback(
    (itemId: string) => updateReadState([itemId], true),
    [updateReadState],
  );

  const setItemReadState = useCallback(
    (itemId: string, isRead: boolean) => updateReadState([itemId], isRead),
    [updateReadState],
  );

  const markAllReadInScope = useCallback(
    (scope: ItemListScope) => {
      const feedIds = getGuestFeedIdsForScope(
        initialData.items,
        initialData.feeds,
        scope,
      );
      const unreadIds = getUnreadGuestItemIds(
        initialData.items,
        readState,
        feedIds,
      );
      updateReadState(unreadIds, true);
    },
    [initialData.feeds, initialData.items, readState, updateReadState],
  );

  const value = useMemo<GuestContextValue>(
    () => ({
      categories,
      feeds,
      feedErrors: initialData.feedErrors,
      fetchedAt: initialData.fetchedAt,
      unreadCounts,
      getItemsForScope,
      paginateScope,
      getItemById,
      getAdjacentItems,
      markItemRead,
      setItemReadState,
      markAllReadInScope,
      isHydrated,
    }),
    [
      categories,
      feeds,
      initialData.feedErrors,
      initialData.fetchedAt,
      unreadCounts,
      getItemsForScope,
      paginateScope,
      getItemById,
      getAdjacentItems,
      markItemRead,
      setItemReadState,
      markAllReadInScope,
      isHydrated,
    ],
  );

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within GuestProvider");
  }
  return context;
}
