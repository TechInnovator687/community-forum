import { describe, expect, it } from "vitest";
import { buildPaginatedResult, normalizePaginationInput, resolvePagination } from "./PaginationService";

describe("normalizePaginationInput", () => {
  it("defaults to page 1 and page size 5 when no input is given", () => {
    expect(normalizePaginationInput()).toEqual({ page: 1, pageSize: 5 });
  });

  it("clamps a non-positive page up to 1", () => {
    expect(normalizePaginationInput({ page: 0 }).page).toBe(1);
    expect(normalizePaginationInput({ page: -5 }).page).toBe(1);
  });

  it("truncates fractional values", () => {
    expect(normalizePaginationInput({ page: 2.9 }).page).toBe(2);
    expect(normalizePaginationInput({ pageSize: 5.9 }).pageSize).toBe(5);
  });

  it("clamps page size to the maximum of 100", () => {
    expect(normalizePaginationInput({ pageSize: 250 }).pageSize).toBe(100);
  });

  it("clamps a non-positive page size up to 1", () => {
    expect(normalizePaginationInput({ pageSize: 0 }).pageSize).toBe(1);
  });

  it("falls back to defaults for non-finite input", () => {
    expect(normalizePaginationInput({ page: Number.NaN, pageSize: Number.POSITIVE_INFINITY })).toEqual({
      page: 1,
      pageSize: 5
    });
  });
});

describe("resolvePagination", () => {
  it("computes offset and total pages for an in-range page", () => {
    const resolved = resolvePagination({ page: 2, pageSize: 5 }, 12);

    expect(resolved).toMatchObject({ page: 2, pageSize: 5, limit: 5, offset: 5, totalItems: 12, totalPages: 3 });
  });

  it("clamps a requested page beyond the last page down to the last page", () => {
    const resolved = resolvePagination({ page: 999, pageSize: 5 }, 12);

    expect(resolved).toMatchObject({ page: 3, offset: 10, totalPages: 3 });
  });

  it("resolves an empty dataset to page 1 with zero total pages", () => {
    const resolved = resolvePagination({ page: 4, pageSize: 5 }, 0);

    expect(resolved).toMatchObject({ page: 1, offset: 0, totalItems: 0, totalPages: 0 });
  });

  it("keeps the first page in range when the dataset fits on one page", () => {
    const resolved = resolvePagination({ page: 1, pageSize: 5 }, 3);

    expect(resolved).toMatchObject({ page: 1, offset: 0, totalPages: 1 });
  });
});

describe("buildPaginatedResult", () => {
  it("marks both previous and next pages available on a middle page", () => {
    const resolved = resolvePagination({ page: 2, pageSize: 5 }, 12);
    const result = buildPaginatedResult(["a", "b"], resolved);

    expect(result).toMatchObject({
      items: ["a", "b"],
      page: 2,
      pageSize: 5,
      totalItems: 12,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true
    });
  });

  it("disables the previous page on the first page", () => {
    const resolved = resolvePagination({ page: 1, pageSize: 5 }, 12);
    const result = buildPaginatedResult([], resolved);

    expect(result.hasPreviousPage).toBe(false);
    expect(result.hasNextPage).toBe(true);
  });

  it("disables the next page on the last page", () => {
    const resolved = resolvePagination({ page: 3, pageSize: 5 }, 12);
    const result = buildPaginatedResult([], resolved);

    expect(result.hasPreviousPage).toBe(true);
    expect(result.hasNextPage).toBe(false);
  });

  it("disables both directions for an empty result set", () => {
    const resolved = resolvePagination({ page: 1, pageSize: 5 }, 0);
    const result = buildPaginatedResult([], resolved);

    expect(result.hasPreviousPage).toBe(false);
    expect(result.hasNextPage).toBe(false);
    expect(result.totalPages).toBe(0);
  });
});
