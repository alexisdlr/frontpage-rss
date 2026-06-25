"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppSidebar } from "@/src/components/dashboard/app-shell/app-sidebar";
import { Button } from "@/src/components/ui/button";

import type { CategoryWithMeta, FeedWithMeta } from "@/src/types/actions";
import Link from "next/link";
import Image from "next/image";

const SIDEBAR_STORAGE_KEY = "frontpage-sidebar-collapsed";
const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const sidebarTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

type AppShellClientProps = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  totalUnread: number;
  uncategorizedUnread: number;
  children: React.ReactNode;
};

export function AppShellClient({
  categories,
  feeds,
  totalUnread,
  uncategorizedUnread,
  children,
}: AppShellClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") {
      setDesktopCollapsed(true);
    }
    setHasHydrated(true);
  }, []);

  const toggleDesktopCollapsed = useCallback(() => {
    setDesktopCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <motion.div
        className="hidden shrink-0 overflow-hidden border-r border-border md:flex md:h-dvh md:flex-col"
        initial={false}
        animate={{
          width: hasHydrated
            ? desktopCollapsed
              ? SIDEBAR_COLLAPSED_WIDTH
              : SIDEBAR_EXPANDED_WIDTH
            : SIDEBAR_EXPANDED_WIDTH,
        }}
        transition={sidebarTransition}
      >
        <AppSidebar
          categories={categories}
          feeds={feeds}
          totalUnread={totalUnread}
          uncategorizedUnread={uncategorizedUnread}
          collapsed={desktopCollapsed}
          onToggleCollapse={toggleDesktopCollapsed}
          className="mt-16 h-[calc(100dvh-4rem)] min-h-0"
        />
      </motion.div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              key="sidebar-backdrop"
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="sidebar-drawer"
              className="fixed inset-y-0 left-0 z-50 w-sidebar border-r border-border bg-surface shadow-lg md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={sidebarTransition}
            >
              <AppSidebar
                categories={categories}
                feeds={feeds}
                totalUnread={totalUnread}
                uncategorizedUnread={uncategorizedUnread}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
                className="h-dvh"
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
          <Link
            className="hover:text-text-primary flex items-center font-black text-text-primary gap-1"
            href="/dashboard"
          >
            <Image
              src="/images/icon-512.webp"
              alt="Frontpage"
              width={40}
              height={40}
            />
            Frontpage
          </Link>
          <div className="w-11" aria-hidden="true" />
        </header>

        <main id="app-main" className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-feed px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
