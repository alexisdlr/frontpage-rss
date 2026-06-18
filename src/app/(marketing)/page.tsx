import Hero from "@/src/components/marketing/hero";
import Header from "@/src/components/shared/header";

import Link from "next/link";

const highlights = [
  {
    title: "Organize by category",
    description:
      "Group feeds into Frontend, Design, DevOps, and more. Scan what matters without the noise.",
  },
  {
    title: "Track what you've read",
    description:
      "Unread counts per feed and category. Mark items read individually or in bulk.",
  },
  {
    title: "Distraction-free reading",
    description:
      "Open articles in a calm reader view when full content is available, or jump to the source.",
  },
  {
    title: "Real RSS & Atom feeds",
    description:
      "Parse RSS 2.0, Atom, and RDF feeds with robust handling of encoding and date quirks.",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <Header />

      <main>
        <Hero />

        <section className="bg-surface" aria-labelledby="features-heading">
          <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
            <h2
              id="features-heading"
              className="text-2xl font-semibold text-text-primary"
            >
              Built for focused reading
            </h2>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Everything you need to stay on top of your feeds without drowning
              in tabs.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {highlights.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-lg border border-border bg-surface p-5 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="bg-surface px-4 py-16 sm:px-6"
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-page">
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
                  required.
                </p>
                <Link href="/signup" className="cta-banner__button">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-page px-4 py-6 sm:px-6">
          <p className="text-sm text-text-tertiary">
            Frontpage — a calm feed reader for developers and designers.
          </p>
        </div>
      </footer>
    </div>
  );
}
