import type { ReactNode } from "react";
import { cn } from "@/lib/utils/ClassNames";

type SidebarProps = {
  children: ReactNode;
  className?: string;
};

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "z-30 hidden border-border bg-card md:block md:h-full md:w-16 md:shrink-0 md:overflow-y-auto md:overflow-x-hidden md:border-r lg:w-64",
        className,
      )}
    >
      {children}
    </aside>
  );
}

