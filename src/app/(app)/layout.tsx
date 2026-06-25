import { getCategories } from "@/src/actions/categories";
import { getFeeds } from "@/src/actions/feeds";
import { getUserLayoutOrDefault } from "@/src/actions/preferences";
import { getUnreadCounts } from "@/src/actions/read-state";
import { AppShellClient } from "@/src/components/dashboard/app-shell/app-shell-client";
import { LayoutProvider } from "@/src/components/layout/layout-provider";
import Header from "@/src/components/shared/header";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categoriesResult, feedsResult, unreadResult, initialLayout] =
    await Promise.all([
      getCategories(),
      getFeeds(),
      getUnreadCounts(),
      getUserLayoutOrDefault(),
    ]);

  const categories = categoriesResult.ok ? categoriesResult.data : [];
  const feeds = feedsResult.ok ? feedsResult.data : [];
  const unread = unreadResult.ok
    ? unreadResult.data
    : { total: 0, uncategorized: 0, byFeed: {}, byCategory: {} };

  const feedCountByCategory: Record<string, number> = {};
  for (const feed of feeds) {
    if (!feed.category_id) continue;
    feedCountByCategory[feed.category_id] =
      (feedCountByCategory[feed.category_id] ?? 0) + 1;
  }

  return (
    <>
      <Header categories={categories} feedCountByCategory={feedCountByCategory} />
      <LayoutProvider initialLayout={initialLayout}>
        <AppShellClient
          categories={categories}
          feeds={feeds}
          totalUnread={unread.total}
          uncategorizedUnread={unread.uncategorized}
        >
          {children}
        </AppShellClient>
      </LayoutProvider>
    </>
  );
}
