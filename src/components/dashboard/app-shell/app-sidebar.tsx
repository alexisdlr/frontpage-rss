"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  FolderOpen,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { FeedFavicon } from "@/src/components/items/feed-favicon";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import type { CategoryWithMeta, FeedWithMeta } from "@/src/types/actions";
import SearchFeedsInput from "../../shared/search-feeds";

const CATEGORY_DOT_COLORS = [
  "bg-accent",
  "bg-[#e879a8]",
  "bg-warning",
  "bg-[#6366f1]",
  "bg-[#428475]",
] as const;

const labelTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

type AppSidebarProps = {
  categories: CategoryWithMeta[];
  feeds: FeedWithMeta[];
  totalUnread: number;
  uncategorizedUnread: number;
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
  collapsed,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  dotColor?: string;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const showUnreadDot = collapsed && typeof count === "number" && count > 0;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "flex min-h-10 items-center rounded-md py-2 text-sm transition-colors",
        collapsed ? "justify-center px-2" : "justify-between gap-2 px-3",
        active
          ? "bg-accent-subtle font-medium text-text-primary"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
        className,
      )}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      <span
        className={cn(
          "flex min-w-0 items-center",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        {dotColor ? (
          <span className="relative shrink-0">
            <span
              className={cn("block size-2 rounded-full", dotColor)}
              aria-hidden="true"
            />
            {showUnreadDot ? (
              <span
                className="absolute -top-1 -right-1 size-2 rounded-full bg-accent ring-2 ring-surface"
                aria-hidden="true"
              />
            ) : null}
          </span>
        ) : Icon ? (
          <span className="relative shrink-0">
            <Icon className="size-4" aria-hidden="true" />
            {showUnreadDot ? (
              <span
                className="absolute -top-1 -right-1 size-2 rounded-full bg-accent ring-2 ring-surface"
                aria-hidden="true"
              />
            ) : null}
          </span>
        ) : null}
        <motion.span
          initial={false}
          animate={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
          }}
          transition={labelTransition}
          className="overflow-hidden whitespace-nowrap"
          aria-hidden={collapsed}
        >
          {label}
        </motion.span>
      </span>
      {!collapsed && typeof count === "number" ? (
        <motion.span
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={labelTransition}
        >
          <CountBadge count={count} />
        </motion.span>
      ) : null}
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
  collapsed,
  onNavigate,
}: {
  category: CategoryWithMeta;
  categoryFeeds: FeedWithMeta[];
  dotColor: string;
  pathname: string;
  collapsed?: boolean;
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
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
      {!collapsed && categoryFeeds.length > 0 ? (
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
  collapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isSaved = pathname === "/saved";
  const isSearch = pathname === "/search";
  const isUncategorized = pathname === "/category/uncategorized";

  const { byCategoryId, uncategorized } = useMemo(
    () => groupFeedsByCategory(categories, feeds),
    [categories, feeds],
  );

  const showUncategorized =
    uncategorized.length > 0 || uncategorizedUnread > 0 || isUncategorized;

  return (
    <aside
      className={cn("flex h-full min-h-0 flex-col bg-surface", className)}
      aria-label="Sidebar navigation"
    >
      <nav
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-3 py-4"
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
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
          <li>
            <NavLink
              href="/saved"
              label="Saved"
              icon={Bookmark}
              active={isSaved}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
          <li>
            <NavLink
              href="/search"
              label="Search"
              icon={Search}
              active={isSearch}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
          <li className="mt-2 px-2 md:hidden">
            <SearchFeedsInput />
          </li>
        </ul>

        <div className="mt-6">
          <motion.p
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              height: collapsed ? 0 : "auto",
            }}
            transition={labelTransition}
            className="overflow-hidden px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary"
            aria-hidden={collapsed}
          >
            Categories
          </motion.p>
          <ul className={cn("space-y-2", collapsed ? "mt-0" : "mt-2")}>
            {categories.map((category, index) => (
              <CategoryGroup
                key={category.id}
                category={category}
                categoryFeeds={byCategoryId.get(category.id) ?? []}
                dotColor={
                  CATEGORY_DOT_COLORS[index % CATEGORY_DOT_COLORS.length]
                }
                pathname={pathname}
                collapsed={collapsed}
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
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
                {!collapsed && uncategorized.length > 0 ? (
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

      {onToggleCollapse ? (
        <div className="hidden shrink-0 border-t border-border p-3 md:block">
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "w-full text-text-secondary hover:text-text-primary",
              collapsed ? "min-h-10" : "justify-start gap-2",
            )}
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="size-4" aria-hidden="true" />
                <motion.span
                  initial={false}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={labelTransition}
                >
                  Collapse
                </motion.span>
              </>
            )}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
