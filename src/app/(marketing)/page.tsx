import Header from "@/src/components/shared/header";
import { LogInIcon, RssIcon } from "lucide-react";
import Image from "next/image";
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
        <section className="h-dvh hero-gradient animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <div className="relative z-10 mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24 h-full flex flex-col justify-center gap-4">
            <div className="flex flex-col items-start lg:items-center ">
              <div className="flex items-center justify-start lg:justify-center gap-2">
                <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                  <RssIcon className="size-3 text-accent" />
                </span>
                <p className="text-sm font-medium uppercase tracking-wide text-accent">
                  RSS feed reader
                </p>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-start lg:text-center text-text-primary sm:text-4xl lg:text-5xl">
                Take control of your news feed
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-text-secondary text-start lg:text-center">
                Aggregate RSS and Atom feeds into a single, calm reading
                dashboard. Organize by category, track what you&apos;ve read,
                and focus on the content that matters.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-start flex-col lg:justify-center gap-3">
                <Link
                  href="/signup"
                  className="flex min-h-11 items-center justify-center rounded-lg btn-marketing px-5 py-2.5 text-sm text-white transition-colors hover:bg-accent-hover border-none font-bold"
                >
                  <span>Create an account</span>{" "}
                  <LogInIcon className="size-3 ml-2 " />
                </Link>
                <span className="text-text-secondary text-sm font-medium text-center">
                  No credit card required
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center mt-10 lg:mt-0">
              <Image
                src="/images/screenshot.png"
                alt="Screenshot of the RSS feed reader"
                width={1000}
                height={1000}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        <section
          className="bg-surface"
          aria-labelledby="features-heading"
        >
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
