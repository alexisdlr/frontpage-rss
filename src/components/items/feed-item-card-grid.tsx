"use client";

import { AnimatePresence, motion } from "framer-motion";

import { FeedItemCard } from "@/src/components/items/feed-item-card";

import type { BookmarkedItemWithMeta, ItemListScope } from "@/src/types/actions";

const cardTransition = {
  duration: 0.24,
  ease: [0.4, 0, 0.2, 1] as const,
};

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

type FeedItemCardGridProps = {
  items: BookmarkedItemWithMeta[];
  scope: ItemListScope;
  highlightQuery?: string;
};

export function FeedItemCardGrid({
  items,
  scope,
  highlightQuery,
}: FeedItemCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              ...cardTransition,
              delay: Math.min(index * 0.04, 0.28),
            }}
          >
            <FeedItemCard
              item={item}
              scope={scope}
              highlightQuery={highlightQuery}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
