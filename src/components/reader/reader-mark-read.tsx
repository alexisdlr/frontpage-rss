"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { markItemRead } from "@/src/actions/read-state";

type ReaderMarkReadProps = {
  itemId: string;
  isRead: boolean;
};

export function ReaderMarkRead({ itemId, isRead }: ReaderMarkReadProps) {
  const router = useRouter();
  const markedRef = useRef(false);

  useEffect(() => {
    if (isRead || markedRef.current) return;

    markedRef.current = true;

    void markItemRead(itemId).then((result) => {
      if (result.ok) {
        router.refresh();
      }
    });
  }, [itemId, isRead, router]);

  return null;
}
