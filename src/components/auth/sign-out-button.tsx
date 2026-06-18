"use client";

import { signOut } from "@/src/actions/auth";
import { startNavigationProgress } from "@/src/lib/navigation-progress";

export function SignOutButton() {
  return (
    <form
      action={signOut}
      onSubmit={() => startNavigationProgress({ showOverlay: true })}
    >
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
      >
        Sign out
      </button>
    </form>
  );
}
