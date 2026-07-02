import type { ButtonHTMLAttributes } from "react";
import { Button } from "./button";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPrevious?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onNext?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export function Pagination({ page, pageCount, onPrevious, onNext }: PaginationProps) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <Button variant="secondary" size="sm" onClick={onPrevious} disabled={page <= 1}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={page >= pageCount}>
        Next
      </Button>
    </nav>
  );
}
