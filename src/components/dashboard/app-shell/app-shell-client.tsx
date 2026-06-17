"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AppSidebar } from "@/src/components/dashboard/app-shell/app-sidebar";
import { Button } from "@/src/components/ui/button";

import type { CategoryWithMeta, FeedWithMeta } from "@/src/types/actions";

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

  return (
    <div className="flex min-h-dvh bg-white">
      <div className="hidden w-sidebar shrink-0 border-r border-border md:block">
        <AppSidebar
          categories={categories}
          feeds={feeds}
          totalUnread={totalUnread}
          uncategorizedUnread={uncategorizedUnread}
          className="sticky top-0 h-dvh"
        />
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-sidebar border-r border-border shadow-lg md:hidden">
            <AppSidebar
              categories={categories}
              feeds={feeds}
              totalUnread={totalUnread}
              uncategorizedUnread={uncategorizedUnread}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 items-center justify-between border-b border-border px-4 sm:px-6 md:hidden">
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
          <span className="text-base font-semibold text-text-primary">
            Frontpage
          </span>
          <div className="w-11" aria-hidden="true" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-feed px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
