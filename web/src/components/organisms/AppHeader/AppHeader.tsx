"use client";

import Link from "next/link";
import { Plus, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/atoms";
import { DemoUserSwitcher, ThemeToggleButton } from "@/components/molecules";

export function AppHeaderBrand() {
  const t = useTranslations("nav");

  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="hidden text-base font-semibold text-foreground sm:inline">{t("brand")}</span>
    </Link>
  );
}

export function AppHeaderSearch() {
  const t = useTranslations("nav");

  return (
    <div className="relative hidden w-full max-w-md items-center lg:flex">
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        disabled
        aria-label={t("searchPlaceholder")}
        placeholder={t("searchPlaceholder")}
        title={t("comingSoon")}
        wrapperClassName="w-full"
        className="h-10 w-full rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}

export function AppHeaderActions() {
  const t = useTranslations("nav");

  return (
    <>
      <Button
        type="button"
        variant="unstyled"
        size="unstyled"
        disabled
        title={t("comingSoon")}
        className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
      >
        <Plus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t("createPost")}</span>
      </Button>
      <ThemeToggleButton />
      <DemoUserSwitcher />
    </>
  );
}
