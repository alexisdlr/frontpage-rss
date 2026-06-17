import Link from "next/link";

import { LoginForm } from "@/components/auth/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-text-primary">Sign in</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Welcome back. Sign in to access your feeds.
      </p>
      <div className="mt-6">
        <LoginForm redirectTo={redirectTo} />
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
          Sign up
        </Link>
      </p>
    </div>
  );
}
