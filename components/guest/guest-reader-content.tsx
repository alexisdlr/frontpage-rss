"use client";

import { GuestReader } from "@/components/guest/guest-reader";

import type { ItemListScope } from "@/types/actions";

type GuestReaderContentProps = {
  itemId: string;
  scope: ItemListScope;
};

export function GuestReaderContent({ itemId, scope }: GuestReaderContentProps) {
  return <GuestReader itemId={itemId} scope={scope} />;
}
