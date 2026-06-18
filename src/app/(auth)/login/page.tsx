import { Metadata } from "next";
import LoginContent from "@/src/components/auth/login-content";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  return <LoginContent redirectTo={redirectTo} />;
}
