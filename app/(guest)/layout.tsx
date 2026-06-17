import { Suspense } from "react";

import { GuestProvider } from "@/components/guest/guest-provider";
import { GuestLayoutSkeleton } from "@/components/guest/guest-layout-skeleton";
import { GuestShell } from "@/components/guest/guest-shell";
import { loadGuestFeedData } from "@/lib/guest/load-data";
import Header from "@/components/dashboard/shared/header";

async function GuestLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await loadGuestFeedData();

  return (
    <GuestProvider initialData={data}>
      <>
        <Header />
        <GuestShell>{children}</GuestShell>
      </>
    </GuestProvider>
  );
}

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuestLayoutSkeleton />}>
      <GuestLayoutContent>{children}</GuestLayoutContent>
    </Suspense>
  );
}
