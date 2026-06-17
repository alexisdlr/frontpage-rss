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
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold text-text-primary">
            Frontpage
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className=" animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            RSS feed reader
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Take control of your news feed
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Aggregate RSS and Atom feeds into a single, calm reading dashboard.
            Organize by category, track what you&apos;ve read, and focus on the
            content that matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Sign up
            </Link>
            <Link
              href="/guest"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Try as Guest
            </Link>
          </div>
        </section>

        <section
          className="border-t border-border bg-bg-secondary"
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

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-content flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Ready to get started?
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Create an account to save your feeds, or explore with guest
                mode.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign up
              </Link>
              <Link
                href="/guest"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
              >
                Try as Guest
              </Link>
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
