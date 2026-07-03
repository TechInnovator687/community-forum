export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 100;

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type NormalizedPagination = {
  page: number;
  pageSize: number;
};

export type ResolvedPagination = {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

// Parses raw pagination input into safe defaults/bounds. This does not know
// about the dataset size yet, so it cannot clamp `page` to the last valid page.
export function normalizePaginationInput(input: PaginationInput = {}): NormalizedPagination {
  return {
    page: clamp(input.page, DEFAULT_PAGE, 1, Number.POSITIVE_INFINITY),
    pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE)
  };
}

// Resolves the effective page/offset for a dataset once its total size is
// known, clamping an out-of-range requested page down to the last real page.
export function resolvePagination(requested: NormalizedPagination, totalItems: number): ResolvedPagination {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / requested.pageSize);
  const page = totalPages === 0 ? 1 : Math.min(requested.page, totalPages);

  return {
    page,
    pageSize: requested.pageSize,
    limit: requested.pageSize,
    offset: (page - 1) * requested.pageSize,
    totalItems,
    totalPages
  };
}

export function buildPaginatedResult<T>(items: T[], resolved: ResolvedPagination): PaginatedResult<T> {
  return {
    items,
    page: resolved.page,
    pageSize: resolved.pageSize,
    totalItems: resolved.totalItems,
    totalPages: resolved.totalPages,
    hasPreviousPage: resolved.page > 1,
    hasNextPage: resolved.page < resolved.totalPages
  };
}

function clamp(value: number | undefined, fallback: number, min: number, max: number): number {
  const parsed = value === undefined ? fallback : Math.trunc(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}
