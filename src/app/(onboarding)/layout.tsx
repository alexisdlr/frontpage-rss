import Image from "next/image";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/images/icon-512.webp"
            alt=""
            width={28}
            height={28}
            aria-hidden="true"
          />
          <span className="text-lg font-semibold text-text-primary">
            Frontpage
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-16">
        {children}
      </main>
    </div>
  );
}
