"use client";

import { GuestReader } from "@/src/components/guest/guest-reader";

import type { ItemListScope } from "@/src/types/actions";

type GuestReaderContentProps = {
  itemId: string;
  scope: ItemListScope;
};

export function GuestReaderContent({ itemId, scope }: GuestReaderContentProps) {
  return <GuestReader itemId={itemId} scope={scope} />;
}
