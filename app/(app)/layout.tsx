import { getCategories } from "@/actions/categories";
import { getFeeds } from "@/actions/feeds";
import { getUnreadCounts } from "@/actions/read-state";
import { AppShellClient } from "@/components/app-shell/app-shell-client";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <AppShellClient
      categories={categories}
      feeds={feeds}
      totalUnread={unread.total}
      uncategorizedUnread={unread.uncategorized}
      userEmail={user?.email}
    >
      {children}
    </AppShellClient>
  );
}
