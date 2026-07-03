"use client";

import type { HTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/ClassNames";

export function Spinner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const t = useTranslations("common");

  return (
    <span
      aria-label={t("loading")}
      role="status"
      className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      {...props}
    />
  );
}
