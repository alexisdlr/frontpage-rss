import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GuestBanner() {
  return (
    <div className="mb-6 rounded-lg border border-accent/20 bg-accent-subtle px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles
            className="mt-0.5 size-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-text-primary">
              You&apos;re browsing as a guest
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Read state is saved for this session only. Sign up to add your own
              feeds, sync across devices, and keep your progress.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
          <Link href="/signup">Sign up free</Link>
        </Button>
      </div>
    </div>
  );
}
