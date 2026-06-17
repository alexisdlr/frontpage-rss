"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type ReactNode } from "react";

/** Virtualize once enough rows are loaded to affect scroll performance. */
export const VIRTUALIZE_THRESHOLD = 50;
const ESTIMATED_ROW_HEIGHT = 96;

type VirtualizedItemListProps<T> = {
  items: T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

export function VirtualizedItemList<T>({
  items,
  getItemKey,
  renderItem,
}: VirtualizedItemListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = items.length >= VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () =>
      listRef.current?.closest("main") ??
      document.getElementById("app-main"),
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 8,
    enabled: shouldVirtualize,
  });

  if (!shouldVirtualize) {
    return (
      <div
        ref={listRef}
        className="rounded-lg border border-border bg-surface shadow-sm"
      >
        <ul className="divide-y divide-border-subtle">
          {items.map((item) => (
            <li key={getItemKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={listRef}
      className="rounded-lg border border-border bg-surface shadow-sm"
    >
      <ul
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <li
              key={getItemKey(item)}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full border-b border-border-subtle last:border-b-0"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
