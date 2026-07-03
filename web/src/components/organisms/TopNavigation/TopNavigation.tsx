import type { ReactNode } from "react";
import { cn } from "@/lib/utils/ClassNames";

type TopNavigationProps = {
  brand?: ReactNode;
  actions?: ReactNode;
  navigation?: ReactNode;
  className?: string;
};

export function TopNavigation({ brand, actions, navigation, className }: TopNavigationProps) {
  return (
    <header className={cn("sticky top-0 z-40 border-b border-border bg-card", className)}>
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {brand}
          {navigation}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
