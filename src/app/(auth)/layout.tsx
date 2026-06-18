import HeaderAuth from "@/src/components/auth/header-auth";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <HeaderAuth />
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
