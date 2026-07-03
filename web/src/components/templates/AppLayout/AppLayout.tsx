import type { ReactNode } from "react";
import { AppShell } from "@/components/organisms";

type AppLayoutProps = {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  topNavigation?: ReactNode;
  mobileNav?: ReactNode;
};

export function AppLayout({ children, className, mobileNav, sidebar, topNavigation }: AppLayoutProps) {
  return (
    <AppShell
      {...(className === undefined ? {} : { className })}
      sidebar={sidebar}
      topNavigation={topNavigation}
      mobileNav={mobileNav}
    >
      {children}
    </AppShell>
  );
}

export { Container } from "./primitives/container";
export { Inline, Stack } from "./primitives/stack";
