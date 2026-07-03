"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Bookmark, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDemoUser } from "@/components/providers/DemoUserProvider";
import { useSavedPosts } from "@/hooks/queries";
import { DEFAULT_COURSE_ID } from "@/constants";
import { cn } from "@/lib/utils/ClassNames";

const feedHref = `/courses/${DEFAULT_COURSE_ID}` as Route;
const savedHref = "/saved" as Route;

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user } = useDemoUser();
  const savedQuery = useSavedPosts({ auth: user, pagination: { page: 1, pageSize: 1 } });
  const bookmarksCount = savedQuery.data?.totalItems;

  const items = [
    { href: feedHref, label: t("feed"), icon: Home, active: pathname.startsWith("/courses") },
    {
      href: savedHref,
      label: t("bookmarks"),
      icon: Bookmark,
      active: pathname === "/saved",
      count: bookmarksCount
    }
  ];

  return (
    <nav
      aria-label={t("primaryNavLabel")}
      className="sticky top-16 z-30 flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary",
            item.active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80",
          )}
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
          {item.count !== undefined ? (
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                item.active ? "bg-primary-foreground/20" : "bg-background",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
