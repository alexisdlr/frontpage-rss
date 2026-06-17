import { GuestCategoryContent } from "@/src/components/guest/guest-category-content";

type GuestCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestCategoryPage({
  params,
}: GuestCategoryPageProps) {
  const { id } = await params;
  return <GuestCategoryContent categoryId={id} />;
}
