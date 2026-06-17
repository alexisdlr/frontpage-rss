"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Inbox, Layers, Rss } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

import type { CategoryWithMeta, FeedWithMeta } from "@/types/actions";

type AppSidebarProps = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  totalUnread: number;
  uncategorizedUnread: number;
  userEmail?: string | null;
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

export function AppSidebar({
  categories,
  feeds,
  totalUnread,
  uncategorizedUnread,
  userEmail,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isUncategorized = pathname === "/category/uncategorized";

  return (
    <aside
      className={cn("flex h-full flex-col bg-bg-secondary", className)}
      aria-label="Sidebar navigation"
    >
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-text-primary"
          onClick={onNavigate}
        >
          Frontpage
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1">
          <li>
            <NavLink
              href="/dashboard"
              label="All items"
              count={totalUnread}
              icon={Inbox}
              active={isDashboard}
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
                  href={`/category/${category.id}`}
                  label={category.name}
                  count={category.unreadCount}
                  icon={Layers}
                  active={pathname === `/category/${category.id}`}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
            <li>
              <NavLink
                href="/category/uncategorized"
                label="Uncategorized"
                count={uncategorizedUnread}
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
                    href={`/feed/${feed.id}`}
                    label={feed.displayTitle}
                    count={feed.unreadCount}
                    icon={Rss}
                    active={pathname === `/feed/${feed.id}`}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        {userEmail ? (
          <p className="truncate text-xs text-text-tertiary">{userEmail}</p>
        ) : null}
        <SignOutButton />
      </div>
    </aside>
  );
}
