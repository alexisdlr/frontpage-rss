"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type ReactNode } from "react";

/** Virtualize once enough rows are loaded to affect scroll performance. */
export const VIRTUALIZE_THRESHOLD = 50;
const ESTIMATED_ROW_HEIGHT = 96;

const rowTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as const,
};

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

type VirtualizedItemListProps<T> = {
  items: T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
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
      listRef.current?.closest("main") ?? document.getElementById("app-main"),
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
        <ul>
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.li
                key={getItemKey(item)}
                layout
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  ...rowTransition,
                  delay: Math.min(index * 0.03, 0.24),
                }}
                className="overflow-hidden border-b border-border-subtle last:border-b-0"
              >
                {renderItem(item, index)}
              </motion.li>
            ))}
          </AnimatePresence>
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
              {renderItem(item, virtualRow.index)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
