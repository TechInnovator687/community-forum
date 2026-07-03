import type { ReactNode } from "react";
import { cn } from "@/lib/utils/ClassNames";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</span>
      ) : null}
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
