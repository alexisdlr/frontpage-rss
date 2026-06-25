"use client";

import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/src/components/marketing/scroll-reveal";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/guest", label: "Guest demo" },
] as const;

const accountLinks = [
  { href: "/signup", label: "Sign up" },
  { href: "/login", label: "Log in" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary">
      <div className="mx-auto max-w-page px-4 py-14 sm:px-6">
        <ScrollReveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Image
                  src="/images/icon-512.webp"
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden="true"
                />
                <span className="text-lg font-bold text-text-primary">
                  Frontpage
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
                A calm RSS feed reader for developers and designers. Organize
                sources, track unread, and read without the noise.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
                Product
              </h2>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
                Account
              </h2>
              <ul className="mt-4 space-y-2.5">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col gap-3 text-sm text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Frontpage. Built as a Frontend Mentor product challenge.</p>
            <p>
              RSS · Atom · Reader · Search · Saved
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
