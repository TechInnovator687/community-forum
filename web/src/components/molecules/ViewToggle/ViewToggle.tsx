"use client";

import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils/ClassNames";

export type ListView = "list" | "grid";

type ViewToggleProps = {
  view: ListView;
  onChange: (view: ListView) => void;
};

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const t = useTranslations("common.view");

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-1">
      <Button
        type="button"
        variant="unstyled"
        size="unstyled"
        aria-label={t("list")}
        aria-pressed={view === "list"}
        onClick={() => {
          onChange("list");
        }}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary",
          view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="unstyled"
        size="unstyled"
        aria-label={t("grid")}
        aria-pressed={view === "grid"}
        onClick={() => {
          onChange("grid");
        }}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary",
          view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
