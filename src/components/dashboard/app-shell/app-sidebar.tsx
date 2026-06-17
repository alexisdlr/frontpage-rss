"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FolderOpen, Inbox } from "lucide-react";
import { useMemo } from "react";

import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { cn } from "@/src/lib/utils";

import type { CategoryWithMeta, FeedWithMeta } from "@/src/types/actions";

const CATEGORY_DOT_COLORS = [
  "bg-accent",
  "bg-[#e879a8]",
  "bg-warning",
  "bg-[#6366f1]",
  "bg-[#428475]",
] as const;

type AppSidebarProps = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  totalUnread: number;
  uncategorizedUnread: number;
  onNavigate?: () => void;
  className?: string;
};

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLink({
  href,
  label,
  count,
  icon: Icon,
  dotColor,
  active,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  dotColor?: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-10 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent-subtle font-medium text-text-primary"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex min-w-0 items-center gap-2">
        {dotColor ? (
          <span
            className={cn("size-2 shrink-0 rounded-full", dotColor)}
            aria-hidden="true"
          />
        ) : Icon ? (
          <Icon className="size-4 shrink-0" aria-hidden="true" />
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" ? <CountBadge count={count} /> : null}
    </Link>
  );
}

function FeedNavLink({
  feed,
  active,
  onNavigate,
}: {
  feed: FeedWithMeta;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={`/feed/${feed.id}`}
      onClick={onNavigate}
      className={cn(
        "flex min-h-9 items-center justify-between gap-2 rounded-md py-1.5 pr-3 pl-9 text-sm transition-colors",
        active
          ? "bg-accent-subtle font-medium text-text-primary"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex min-w-0 items-center gap-2">
        <FeedFavicon
          url={feed.favicon_url}
          title={feed.displayTitle}
          size="sm"
        />
        <span className="truncate">{feed.displayTitle}</span>
      </span>
      <CountBadge count={feed.unreadCount} />
    </Link>
  );
}

function CategoryGroup({
  category,
  categoryFeeds,
  dotColor,
  pathname,
  onNavigate,
}: {
  category: CategoryWithMeta;
  categoryFeeds: FeedWithMeta[];
  dotColor: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const categoryHref = `/category/${category.id}`;
  const isCategoryActive = pathname === categoryHref;

  return (
    <li>
      <NavLink
        href={categoryHref}
        label={category.name}
        count={category.unreadCount}
        dotColor={dotColor}
        active={isCategoryActive}
        onNavigate={onNavigate}
      />
      {categoryFeeds.length > 0 ? (
        <ul
          className="mt-0.5 space-y-0.5"
          aria-label={`Feeds in ${category.name}`}
        >
          {categoryFeeds.map((feed) => (
            <li key={feed.id}>
              <FeedNavLink
                feed={feed}
                active={pathname === `/feed/${feed.id}`}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function groupFeedsByCategory(
  categories: CategoryWithMeta[],
  feeds: FeedWithMeta[],
) {
  const byCategoryId = new Map<string, FeedWithMeta[]>(
    categories.map((category) => [category.id, []]),
  );
  const uncategorized: FeedWithMeta[] = [];

  for (const feed of feeds) {
    if (feed.category_id && byCategoryId.has(feed.category_id)) {
      byCategoryId.get(feed.category_id)!.push(feed);
    } else {
      uncategorized.push(feed);
    }
  }

  return { byCategoryId, uncategorized };
}

export function AppSidebar({
  categories,
  feeds,
  totalUnread,
  uncategorizedUnread,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isSaved = pathname === "/saved";
  const isUncategorized = pathname === "/category/uncategorized";

  const { byCategoryId, uncategorized } = useMemo(
    () => groupFeedsByCategory(categories, feeds),
    [categories, feeds],
  );

  const showUncategorized =
    uncategorized.length > 0 || uncategorizedUnread > 0 || isUncategorized;

  return (
    <aside
      className={cn("flex md:mt-16 h-full flex-col bg-surface", className)}
      aria-label="Sidebar navigation"
    >
      <nav
        className="flex-1 overflow-y-auto scrollbar-none px-3 py-4"
        aria-label="Main navigation"
      >
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
          <li>
            <NavLink
              href="/saved"
              label="Saved"
              icon={Bookmark}
              active={isSaved}
              onNavigate={onNavigate}
            />
          </li>
        </ul>

        <div className="mt-6">
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Categories
          </p>
          <ul className="mt-2 space-y-2">
            {categories.map((category, index) => (
              <CategoryGroup
                key={category.id}
                category={category}
                categoryFeeds={byCategoryId.get(category.id) ?? []}
                dotColor={
                  CATEGORY_DOT_COLORS[index % CATEGORY_DOT_COLORS.length]
                }
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}

            {showUncategorized ? (
              <li>
                <NavLink
                  href="/category/uncategorized"
                  label="Uncategorized"
                  count={uncategorizedUnread}
                  icon={FolderOpen}
                  active={isUncategorized}
                  onNavigate={onNavigate}
                />
                {uncategorized.length > 0 ? (
                  <ul
                    className="mt-0.5 space-y-0.5"
                    aria-label="Uncategorized feeds"
                  >
                    {uncategorized.map((feed) => (
                      <li key={feed.id}>
                        <FeedNavLink
                          feed={feed}
                          active={pathname === `/feed/${feed.id}`}
                          onNavigate={onNavigate}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ) : null}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
