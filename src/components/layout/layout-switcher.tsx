"use client";

import { LayoutGrid, List, Rows3 } from "lucide-react";

import { useFeedLayout } from "@/src/components/layout/layout-provider";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { FeedLayout } from "@/src/lib/layout";

const LAYOUT_OPTIONS: Array<{
  value: FeedLayout;
  label: string;
  shortLabel: string;
  icon: typeof List;
}> = [
  { value: "compact", label: "Compact list", shortLabel: "Compact", icon: Rows3 },
  { value: "standard", label: "Standard list", shortLabel: "Standard", icon: List },
  { value: "cards", label: "Card grid", shortLabel: "Cards", icon: LayoutGrid },
];

export function LayoutSwitcher({ className }: { className?: string }) {
  const { layout, setLayout, isUpdating } = useFeedLayout();

  return (
    <div
      className={cn(
        "inline-flex rounded-md border border-border bg-surface p-0.5",
        className,
      )}
      role="group"
      aria-label="Feed layout"
    >
      {LAYOUT_OPTIONS.map(({ value, label, shortLabel, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant="ghost"
          disabled={isUpdating}
          className={cn(
            "min-h-8 gap-1.5 px-2 sm:px-3",
            layout === value && "bg-accent-subtle text-accent",
          )}
          aria-pressed={layout === value}
          aria-label={label}
          title={label}
          onClick={() => void setLayout(value)}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{shortLabel}</span>
        </Button>
      ))}
    </div>
  );
}
