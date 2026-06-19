"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { RouteLoadingScreen } from "@/src/components/shared/route-loading-screen";
import {
  isFeedBrowseRoute,
  shouldShowNavigationOverlay,
} from "@/src/lib/navigation";

import { cn } from "@/src/lib/utils";
import { registerNavigationProgressHandlers } from "@/src/lib/navigation-progress";

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 350;
const COMPLETE_DELAY_MS = 180;

function getInternalNavigationTarget(
  anchor: HTMLAnchorElement,
  pathname: string,
): string | null {
  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return null;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;

    const current = `${pathname}${window.location.search}`;
    const target = `${url.pathname}${url.search}`;
    return current !== target ? url.pathname : null;
  } catch {
    return null;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigatingRef = useRef(false);
  const overlayShownAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    showTimerRef.current = null;
    hideTimerRef.current = null;
    progressTimerRef.current = null;
  }, []);

  const startProgressAnimation = useCallback(() => {
    if (progressTimerRef.current) return;

    progressTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        const increment = (100 - current) * 0.12 * Math.random();
        return Math.min(current + increment, 92);
      });
    }, 120);
  }, []);

  const cancelNavigation = useCallback(() => {
    clearTimers();
    navigatingRef.current = false;
    setOverlayVisible(false);
    overlayShownAtRef.current = null;
    setProgress(0);
  }, [clearTimers]);

  const startNavigation = useCallback(
    (options?: { showOverlay?: boolean }) => {
      if (navigatingRef.current) return;

      const showOverlay = options?.showOverlay ?? true;

      navigatingRef.current = true;
      setProgress(8);
      startProgressAnimation();

      if (!showOverlay) return;

      showTimerRef.current = setTimeout(() => {
        overlayShownAtRef.current = Date.now();
        setOverlayVisible(true);
      }, SHOW_DELAY_MS);
    },
    [startProgressAnimation],
  );

  const finishNavigation = useCallback(() => {
    if (!navigatingRef.current) return;

    clearTimers();
    navigatingRef.current = false;
    setProgress(100);

    const hideOverlay = () => {
      setOverlayVisible(false);
      overlayShownAtRef.current = null;
      hideTimerRef.current = setTimeout(
        () => setProgress(0),
        COMPLETE_DELAY_MS,
      );
    };

    if (overlayShownAtRef.current) {
      const elapsed = Date.now() - overlayShownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      hideTimerRef.current = setTimeout(hideOverlay, remaining);
      return;
    }

    hideOverlay();
  }, [clearTimers]);

  useEffect(() => {
    return registerNavigationProgressHandlers({
      start: startNavigation,
      cancel: cancelNavigation,
    });
  }, [startNavigation, cancelNavigation]);

  useEffect(() => {
    finishNavigation();
  }, [pathname, searchParams, finishNavigation]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;

      const targetPathname = getInternalNavigationTarget(anchor, pathname);
      if (!targetPathname) return;

      const showOverlay = shouldShowNavigationOverlay(pathname, targetPathname);
      startNavigation({ showOverlay });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startNavigation]);

  useEffect(() => {
    const handlePopState = () => {
      startNavigation({ showOverlay: !isFeedBrowseRoute(pathname) });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, startNavigation]);

  useEffect(() => clearTimers, [clearTimers]);

  const showBar = progress > 0;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-200 h-[3px]"
        aria-hidden={!showBar}
      >
        <motion.div
          className="h-full origin-left bg-accent shadow-[0_0_10px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
          initial={false}
          animate={{
            scaleX: progress / 100,
            opacity: showBar ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ width: "100%" }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Page loading progress"
        />
      </div>

      <AnimatePresence>
        {overlayVisible ? (
          <motion.div
            key="navigation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed inset-0 z-190 flex items-center justify-center bg-bg-primary",
            )}
          >
            <RouteLoadingScreen />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
