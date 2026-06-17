"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Inbox, Layers, Rss } from "lucide-react";

import { useGuest } from "@/components/guest/guest-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GuestSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

function NavLink({
  href,
  label,
  count,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent-subtle font-medium text-text-primary"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex min-w-0 items-center gap-2">
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" && count > 0 ? (
        <span className="shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function GuestSidebar({ onNavigate, className }: GuestSidebarProps) {
  const pathname = usePathname();
  const { categories, feeds, unreadCounts } = useGuest();

  const isAllItems = pathname === "/guest";
  const isUncategorized = pathname === "/guest/category/uncategorized";

  return (
    <aside
      className={cn("flex h-dvh md:mt-16 flex-col bg-surface", className)}
      aria-label="Guest sidebar navigation"
    >
      <nav
        className="flex-1 overflow-y-auto scrollbar-none px-3 py-4"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          <li>
            <NavLink
              href="/guest"
              label="All items"
              count={unreadCounts.total}
              icon={Inbox}
              active={isAllItems}
              onNavigate={onNavigate}
            />
          </li>
        </ul>

        <div className="mt-6">
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Categories
          </p>
          <ul className="mt-2 space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <NavLink
                  href={`/guest/category/${category.id}`}
                  label={category.name}
                  count={category.unreadCount}
                  icon={Layers}
                  active={pathname === `/guest/category/${category.id}`}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
            <li>
              <NavLink
                href="/guest/category/uncategorized"
                label="Uncategorized"
                count={unreadCounts.uncategorized}
                icon={FolderOpen}
                active={isUncategorized}
                onNavigate={onNavigate}
              />
            </li>
          </ul>
        </div>

        {feeds.length > 0 ? (
          <div className="mt-6">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Feeds
            </p>
            <ul className="mt-2 space-y-1">
              {feeds.map((feed) => (
                <li key={feed.id}>
                  <NavLink
                    href={`/guest/feed/${feed.id}`}
                    label={feed.displayTitle}
                    count={feed.unreadCount}
                    icon={Rss}
                    active={pathname === `/guest/feed/${feed.id}`}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <p className="text-xs leading-relaxed text-text-tertiary">
          Sign up to save feeds, sync read state, and customize categories.
        </p>
        <Button asChild className="w-full">
          <Link href="/signup" onClick={onNavigate}>
            Create account
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login" onClick={onNavigate}>
            Sign in
          </Link>
        </Button>
      </div>
    </aside>
  );
}
