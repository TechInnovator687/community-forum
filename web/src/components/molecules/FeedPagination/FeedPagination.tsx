"use client";

import { Pagination } from "@/components/molecules";
import { getNextPage, getPreviousPage } from "@/lib/utils/PaginationState";

type FeedPaginationProps = {
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFetching?: boolean | undefined;
  onPageChange: (page: number) => void;
};

export function FeedPagination({
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  isFetching,
  onPageChange
}: FeedPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      page={page}
      pageCount={pageCount}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
      onPrevious={() => {
        onPageChange(getPreviousPage(page));
      }}
      onNext={() => {
        onPageChange(getNextPage(page, pageCount));
      }}
    />
  );
}
