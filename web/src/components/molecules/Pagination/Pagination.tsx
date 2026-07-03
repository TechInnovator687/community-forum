"use client";

import type { ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { Button, Spinner } from "@/components/atoms";

type PaginationProps = {
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFetching?: boolean | undefined;
  onPrevious?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onNext?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export function Pagination({
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  isFetching = false,
  onPrevious,
  onNext
}: PaginationProps) {
  const t = useTranslations("common.pagination");

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={t("label")}>
      <Button variant="secondary" size="sm" onClick={onPrevious} disabled={!hasPreviousPage || isFetching}>
        {t("previous")}
      </Button>
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFetching ? <Spinner className="size-3.5" aria-hidden="true" /> : null}
        {t("status", { page, pageCount })}
      </span>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNextPage || isFetching}>
        {t("next")}
      </Button>
    </nav>
  );
}
