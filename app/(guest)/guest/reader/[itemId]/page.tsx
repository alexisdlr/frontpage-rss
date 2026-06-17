import { GuestReaderContent } from "@/components/guest/guest-reader-content";
import { parseItemListScope } from "@/lib/scope";

type GuestReaderPageProps = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuestReaderPage({
  params,
  searchParams,
}: GuestReaderPageProps) {
  const { itemId } = await params;
  const resolvedSearchParams = await searchParams;
  const scope = parseItemListScope(resolvedSearchParams);

  return <GuestReaderContent itemId={itemId} scope={scope} />;
}
