"use client";

import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms";
import { useDemoUser } from "@/components/providers/DemoUserProvider";
import { cn } from "@/lib/utils/ClassNames";

export function DemoUserSwitcher() {
  const t = useTranslations("nav");
  const { user, users, setUserId } = useDemoUser();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function selectUser(userId: string) {
    setUserId(userId);
    setIsOpen(false);
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground xl:inline">
        {t("demoUser.label")}
      </span>
      <Button
        type="button"
        variant="unstyled"
        size="unstyled"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("demoUser.label")}
        className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary sm:px-3"
      >
        <span className="truncate xl:hidden">{firstName}</span>
        <span className="hidden truncate xl:inline">
          {user.name} — {t(`role.${user.role}`)}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Button>
      {isOpen ? (
        <ul
          role="listbox"
          aria-label={t("demoUser.label")}
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
        >
          {users.map((candidate) => {
            const isActive = candidate.userId === user.userId;

            return (
              <li key={candidate.userId} role="option" aria-selected={isActive}>
                <Button
                  type="button"
                  variant="unstyled"
                  size="unstyled"
                  onClick={() => {
                    selectUser(candidate.userId);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                    isActive ? "text-primary" : "text-foreground",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{candidate.name}</span>
                    <span className="block text-xs text-muted-foreground">{t(`role.${candidate.role}`)}</span>
                  </span>
                  {isActive ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
