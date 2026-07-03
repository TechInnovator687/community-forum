import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SIZE, getNextPage, getPreviousPage, normalizePagination } from "./PaginationState";

describe("normalizePagination", () => {
  it("defaults to page 1 and the default page size", () => {
    expect(normalizePagination()).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  });

  it("clamps a non-positive page up to 1", () => {
    expect(normalizePagination({ page: 0 }).page).toBe(1);
    expect(normalizePagination({ page: -3 }).page).toBe(1);
  });

  it("clamps page size within [1, 100]", () => {
    expect(normalizePagination({ pageSize: 0 }).pageSize).toBe(1);
    expect(normalizePagination({ pageSize: 500 }).pageSize).toBe(100);
  });

  it("truncates fractional values", () => {
    expect(normalizePagination({ page: 2.7, pageSize: 5.9 })).toEqual({ page: 2, pageSize: 5 });
  });
});

describe("getNextPage", () => {
  it("advances by one page", () => {
    expect(getNextPage(1, 3)).toBe(2);
  });

  it("does not exceed the total page count", () => {
    expect(getNextPage(3, 3)).toBe(3);
  });
});

describe("getPreviousPage", () => {
  it("goes back by one page", () => {
    expect(getPreviousPage(2)).toBe(1);
  });

  it("does not go below page 1", () => {
    expect(getPreviousPage(1)).toBe(1);
  });
});
