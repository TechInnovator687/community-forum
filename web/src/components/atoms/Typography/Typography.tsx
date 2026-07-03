import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/ClassNames";

export function Heading({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-2xl font-semibold tracking-normal text-foreground", className)} {...props} />;
}

export function Text({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-foreground", className)} {...props} />;
}

export function MutedText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

