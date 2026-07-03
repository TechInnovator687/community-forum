import type { ReactNode } from "react";
import { cn } from "@/lib/utils/ClassNames";

type ToastVariant = "default" | "error" | "success";

type ToastProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  variant?: ToastVariant;
};

const variants: Record<ToastVariant, string> = {
  default: "border-border bg-background",
  error: "border-destructive bg-background",
  success: "border-primary bg-background"
};

export function Toast({ action, className, description, title, variant = "default" }: ToastProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 rounded-lg border p-4 shadow-sm", variants[variant], className)}>
      <div className="grid gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

