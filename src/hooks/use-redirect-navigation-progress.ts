"use client";

import { useEffect } from "react";

import {
  cancelNavigationProgress,
  startNavigationProgress,
} from "@/src/lib/navigation-progress";

/** Show logo + bar while a server action redirects (login, sign-up, sign-out). */
export function useRedirectNavigationProgress(
  pending: boolean,
  hasError: boolean,
) {
  useEffect(() => {
    if (pending) {
      startNavigationProgress({ showOverlay: true });
    }
  }, [pending]);

  useEffect(() => {
    if (!pending && hasError) {
      cancelNavigationProgress();
    }
  }, [pending, hasError]);
}
