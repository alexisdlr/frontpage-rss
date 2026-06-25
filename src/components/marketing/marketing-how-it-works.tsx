"use client";

import { ScrollReveal } from "@/src/components/marketing/scroll-reveal";

const steps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up in seconds — no credit card. Or try the guest demo with 19 curated feeds.",
  },
  {
    step: "02",
    title: "Add your feeds",
    description:
      "Paste any RSS URL, import starter packs by topic, or subscribe feed by feed at your pace.",
  },
  {
    step: "03",
    title: "Read with intention",
    description:
      "Browse your dashboard, filter unread, search, save articles, and open the reader when you want depth.",
  },
] as const;

export function MarketingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-fade section-fade-bottom section-fade-to-surface scroll-mt-20 bg-bg-tertiary"
      aria-labelledby="how-it-works-heading"
    >
      <div className="section-fade__inner mx-auto max-w-page px-4 py-20 sm:px-6 sm:py-24">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl"
          >
            From signup to calm inbox in three steps
          </h2>
          <p className="mt-3 text-text-secondary">
            Frontpage is designed to get you reading quickly, without setup
            friction.
          </p>
        </ScrollReveal>

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
          <div
            className="pointer-events-none absolute top-8 right-[16%] left-[16%] hidden h-px bg-border lg:block"
            aria-hidden="true"
          />

          {steps.map((item, index) => (
            <li key={item.step} className="relative list-none">
              <ScrollReveal delay={index * 0.12}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-sm">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
