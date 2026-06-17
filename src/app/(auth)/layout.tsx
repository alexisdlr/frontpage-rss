import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-text-primary">
            Frontpage
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
