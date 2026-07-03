import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, normalizePagination } from "@/lib/utils/PaginationState";

export type SearchPagination = {
  page?: string;
  pageSize?: string;
};

export function getPaginationFromSearch(searchParams: SearchPagination) {
  return normalizePagination({
    page: parsePositiveInteger(searchParams.page, DEFAULT_PAGE),
    pageSize: parsePositiveInteger(searchParams.pageSize, DEFAULT_PAGE_SIZE)
  });
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
