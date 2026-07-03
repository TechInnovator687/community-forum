"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggleButton() {
  const t = useTranslations("nav");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="unstyled"
      size="unstyled"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={t("darkMode")}
      title={t("darkMode")}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
    >
      {isDark ? <Moon className="size-4" aria-hidden="true" /> : <Sun className="size-4" aria-hidden="true" />}
    </Button>
  );
}
