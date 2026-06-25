"use client";

import {
  Bookmark,
  FolderTree,
  Rss,
  ScanSearch,
  Sparkles,
  BookOpen,
} from "lucide-react";

import { ScrollReveal } from "@/src/components/marketing/scroll-reveal";
import { cn } from "@/src/lib/utils";

const features = [
  {
    icon: FolderTree,
    title: "Organize by category",
    description:
      "Group feeds into Frontend, Design, DevOps, and more. Scan what matters without the noise.",
  },
  {
    icon: Sparkles,
    title: "Track what you've read",
    description:
      "Unread counts per feed and category. Mark items read individually or in bulk.",
  },
  {
    icon: BookOpen,
    title: "Distraction-free reading",
    description:
      "Open articles in a calm reader view when full content is available, or jump to the source.",
  },
  {
    icon: ScanSearch,
    title: "Search across feeds",
    description:
      "Find articles by title or description across your whole library in one place.",
  },
  {
    icon: Bookmark,
    title: "Save for later",
    description:
      "Bookmark articles from the list or reader and revisit them anytime on Saved.",
  },
  {
    icon: Rss,
    title: "Real RSS & Atom feeds",
    description:
      "Parse RSS 2.0, Atom, and RDF feeds with robust handling of encoding and date quirks.",
  },
] as const;

export function MarketingFeatures() {
  return (
    <section
      id="features"
      className="section-fade section-fade-bottom section-fade-to-tertiary scroll-mt-20 bg-surface"
      aria-labelledby="features-heading"
    >
      <div className="section-fade__inner mx-auto max-w-page px-4 py-20 sm:px-6 sm:py-24">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            Features
          </p>
          <h2
            id="features-heading"
            className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl"
          >
            Built for focused reading
          </h2>
          <p className="mt-3 text-text-secondary">
            Everything you need to stay on top of your feeds without drowning in
            tabs.
          </p>
        </ScrollReveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <li key={feature.title}>
                <ScrollReveal delay={index * 0.07}>
                <article
                  className={cn(
                    "group h-full rounded-xl border border-border bg-bg-primary/60 p-6 shadow-sm transition-colors",
                    "hover:border-accent/30 hover:bg-bg-tertiary/40",
                  )}
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-subtle text-accent transition-transform group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </article>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
