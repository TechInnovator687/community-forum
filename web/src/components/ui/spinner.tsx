import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-label="Loading"
      role="status"
      className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      {...props}
    />
  );
}
