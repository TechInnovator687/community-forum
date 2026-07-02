"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, title, children, onClose, footer, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn("grid w-full max-w-lg gap-4 rounded-lg border bg-background p-4 shadow-lg", className)}
      >
        <header className="flex items-center justify-between gap-3">
          <h2 id="modal-title" className="text-base font-semibold">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </header>
        <div>{children}</div>
        {footer ? <footer className="flex justify-end gap-2">{footer}</footer> : null}
      </section>
    </div>
  );
}
