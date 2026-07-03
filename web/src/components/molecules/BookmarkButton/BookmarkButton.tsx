"use client";

import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Spinner } from "@/components/atoms";
import { cn } from "@/lib/utils/ClassNames";

type BookmarkButtonProps = {
  hasSaved: boolean;
  isPending?: boolean;
  onToggle: () => void;
};

export function BookmarkButton({ hasSaved, isPending = false, onToggle }: BookmarkButtonProps) {
  const t = useTranslations("feed.bookmark");
  const label = hasSaved ? t("remove") : t("save");

  return (
    <Button
      type="button"
      variant="unstyled"
      size="unstyled"
      aria-label={label}
      aria-pressed={hasSaved}
      title={label}
      disabled={isPending}
      onClick={onToggle}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md outline-none transition active:scale-90 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hasSaved ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {isPending ? (
        <Spinner className="size-4" />
      ) : (
        <Bookmark
          className={cn("size-4 transition-transform", hasSaved && "scale-110")}
          aria-hidden="true"
          fill={hasSaved ? "currentColor" : "none"}
        />
      )}
    </Button>
  );
}
