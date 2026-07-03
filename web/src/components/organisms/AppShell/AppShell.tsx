import type { ReactNode } from "react";
import { cn } from "@/lib/utils/ClassNames";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  topNavigation?: ReactNode;
  mobileNav?: ReactNode;
  className?: string;
};

export function AppShell({ children, className, mobileNav, sidebar, topNavigation }: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background md:h-dvh", className)}>
      {topNavigation}
      {mobileNav}
      <div className="min-h-0 md:flex md:flex-1">
        {sidebar}
        <main className="min-w-0 flex-1 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

