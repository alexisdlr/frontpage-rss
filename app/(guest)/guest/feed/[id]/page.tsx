import { GuestFeedContent } from "@/components/guest/guest-feed-content";

type GuestFeedPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestFeedPage({ params }: GuestFeedPageProps) {
  const { id } = await params;
  return <GuestFeedContent feedId={id} />;
}
