// components/shared/header.tsx — Server Component (sin "use client")
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";
import HeaderNav from "./header-nav";
import { CategoryWithMeta } from "@/src/types/actions";

type Props = {
  categories?: CategoryWithMeta[];
};

export default async function Header({ categories = [] }: Props) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HeaderNav user={user ?? undefined} categories={categories} />;
}
