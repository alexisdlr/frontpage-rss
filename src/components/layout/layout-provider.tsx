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

import { updateUserLayout } from "@/src/actions/preferences";
import {
  DEFAULT_FEED_LAYOUT,
  isFeedLayout,
  LAYOUT_STORAGE_KEY,
  type FeedLayout,
} from "@/src/lib/layout";

type LayoutContextValue = {
  layout: FeedLayout;
  setLayout: (layout: FeedLayout) => void;
  isUpdating: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

type LayoutProviderProps = {
  initialLayout?: FeedLayout;
  children: ReactNode;
};

export function LayoutProvider({
  initialLayout = DEFAULT_FEED_LAYOUT,
  children,
}: LayoutProviderProps) {
  const [layout, setLayoutState] = useState<FeedLayout>(initialLayout);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (stored && isFeedLayout(stored)) {
      setLayoutState(stored);
    }
  }, []);

  const setLayout = useCallback(async (next: FeedLayout) => {
    let previous = DEFAULT_FEED_LAYOUT;
    setLayoutState((current) => {
      previous = current;
      return next;
    });
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    setIsUpdating(true);

    const result = await updateUserLayout(next);
    setIsUpdating(false);

    if (!result.ok) {
      setLayoutState(previous);
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, previous);
    }
  }, []);

  const value = useMemo(
    () => ({ layout, setLayout, isUpdating }),
    [layout, setLayout, isUpdating],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useFeedLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useFeedLayout must be used within LayoutProvider");
  }
  return context;
}
