"use client";

import Link from "next/link";
import { LogInIcon } from "lucide-react";

import { ScrollReveal } from "@/src/components/marketing/scroll-reveal";

export function MarketingCta() {
  return (
    <section
      className="section-fade section-fade-bottom section-fade-to-secondary bg-surface px-4 py-20 sm:px-6 sm:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="section-fade__inner mx-auto max-w-page">
        <ScrollReveal y={36}>
          <div className="cta-banner">
            <div className="cta-banner__shapes" aria-hidden="true">
              <span className="cta-banner__circle cta-banner__circle--sea" />
              <span className="cta-banner__circle cta-banner__circle--mint" />
              <span className="cta-banner__circle cta-banner__circle--cream" />
              <span className="cta-banner__circle cta-banner__circle--accent-subtle" />
            </div>
            <div className="cta-banner__content">
              <h2 id="cta-heading" className="cta-banner__title">
                Build your own newsfeed
              </h2>
              <p className="cta-banner__description">
                Ready to give it a go? Create an account — no credit card
                required. Or explore the guest demo first.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="cta-banner__button gap-2">
                  Create account
                  <LogInIcon className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/guest"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ color: "var(--color-cta-banner-text)" }}
                >
                  Try as guest
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
