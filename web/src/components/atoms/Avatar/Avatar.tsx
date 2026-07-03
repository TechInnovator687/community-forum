import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/ClassNames";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  src?: string;
};

export function Avatar({ className, name, src, ...props }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "grid size-10 place-items-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className,
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={name} width={40} height={40} className="size-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
