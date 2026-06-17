import { getCategories } from "@/src/actions/categories";
import { getFeeds } from "@/src/actions/feeds";
import { getUnreadCounts } from "@/src/actions/read-state";
import { AppShellClient } from "@/src/components/dashboard/app-shell/app-shell-client";
import Header from "@/src/components/shared/header";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categoriesResult, feedsResult, unreadResult] = await Promise.all([
    getCategories(),
    getFeeds(),
    getUnreadCounts(),
  ]);

  const categories = categoriesResult.ok ? categoriesResult.data : [];
  const feeds = feedsResult.ok ? feedsResult.data : [];
  const unread = unreadResult.ok
    ? unreadResult.data
    : { total: 0, uncategorized: 0, byFeed: {}, byCategory: {} };

  return (
    <>
      <Header categories={categories} />
      <AppShellClient
        categories={categories}
        feeds={feeds}
        totalUnread={unread.total}
        uncategorizedUnread={unread.uncategorized}
      >
        {children}
      </AppShellClient>
    </>
  );
}
