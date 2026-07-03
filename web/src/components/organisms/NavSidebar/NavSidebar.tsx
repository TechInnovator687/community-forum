"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  Bookmark,
  Briefcase,
  Brain,
  Code2,
  FileText,
  HelpCircle,
  Home,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Palette
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms";
import { useDemoUser } from "@/components/providers/DemoUserProvider";
import { cn } from "@/lib/utils/ClassNames";
import { DEFAULT_COURSE_ID } from "@/constants";
import { useSavedPosts } from "@/hooks/queries";

const feedHref = `/courses/${DEFAULT_COURSE_ID}` as Route;
const savedHref = "/saved" as Route;

export function NavSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user } = useDemoUser();
  const savedQuery = useSavedPosts({ auth: user, pagination: { page: 1, pageSize: 1 } });
  const bookmarksCount = savedQuery.data?.totalItems;

  const primaryItems = [
    { href: feedHref, label: t("feed"), icon: Home, active: pathname.startsWith("/courses") },
    { label: t("myPosts"), icon: FileText, disabled: true },
    { href: savedHref, label: t("bookmarks"), icon: Bookmark, active: pathname === "/saved", count: bookmarksCount }
  ];

  const categoryItems = [
    { label: t("categories.allDiscussions"), icon: MessageSquare },
    { label: t("categories.announcements"), icon: Megaphone },
    { label: t("categories.webDevelopment"), icon: Code2 },
    { label: t("categories.design"), icon: Palette },
    { label: t("categories.career"), icon: Briefcase },
    { label: t("categories.aiMl"), icon: Brain },
    { label: t("categories.general"), icon: LayoutGrid },
    { label: t("categories.offTopic"), icon: HelpCircle }
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-2 lg:p-4">
      <nav className="grid gap-1" aria-label={t("primaryNavLabel")}>
        {primaryItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>

      <div className="hidden gap-1 lg:grid">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("categories.label")}
        </p>
        {categoryItems.map((item) => (
          <NavLink key={item.label} {...item} disabled />
        ))}
      </div>

      <div className="mt-auto hidden gap-3 border-t border-border pt-4 lg:grid">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={user.name} aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{t(`role.${user.role}`)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type NavLinkProps = {
  href?: Route;
  label: string;
  icon: typeof Home;
  active?: boolean;
  disabled?: boolean;
  count?: number | undefined;
};

function NavLink({ href, label, icon: Icon, active = false, disabled = false, count }: NavLinkProps) {
  const t = useTranslations("nav");
  const content = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="hidden min-w-0 flex-1 truncate lg:inline">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "hidden rounded-full px-2 py-0.5 text-xs font-medium lg:inline-flex",
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors lg:justify-start",
    active
      ? "bg-primary text-primary-foreground"
      : disabled
        ? "text-muted-foreground/60"
        : "text-foreground hover:bg-muted focus-visible:bg-muted",
  );

  if (disabled || !href) {
    return (
      <span className={cn(className, "cursor-not-allowed select-none")} title={t("comingSoon")} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={className} title={label}>
      {content}
    </Link>
  );
}
