"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Spinner } from "@/components/atoms";

type DeleteButtonProps = {
  isPending?: boolean;
  onDelete: () => void;
};

export function DeleteButton({ isPending = false, onDelete }: DeleteButtonProps) {
  const t = useTranslations("feed.post");
  const label = t("delete.action");

  return (
    <Button
      type="button"
      variant="unstyled"
      size="unstyled"
      aria-label={label}
      title={label}
      disabled={isPending}
      onClick={onDelete}
      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition active:scale-90 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
    >
      {isPending ? <Spinner className="size-4" /> : <Trash2 className="size-4" aria-hidden="true" />}
    </Button>
  );
}
