import type { ReactNode } from "react";
import { Card } from "../Card";
import { cn } from "@/lib/utils/ClassNames";

type StatCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function StatCard({ icon, title, description, className }: StatCardProps) {
  return (
    <Card className={cn("grid gap-3 p-4", className)}>
      <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
