import type { PaginationParams } from "@/lib/api";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@community-forum/shared/constants";

export { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };

export function normalizePagination(pagination: PaginationParams = {}) {
  const page = Math.max(DEFAULT_PAGE, Math.trunc(pagination.page ?? DEFAULT_PAGE));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(pagination.pageSize ?? DEFAULT_PAGE_SIZE)),
  );

  return {
    page,
    pageSize
  };
}

export function getNextPage(page: number, totalPages: number) {
  return Math.min(totalPages, page + 1);
}

export function getPreviousPage(page: number) {
  return Math.max(DEFAULT_PAGE, page - 1);
}
