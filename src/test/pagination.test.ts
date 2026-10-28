import { describe, expect, it } from "vitest";
import { pageNumbers, paginate } from "../components/ListPagination";

describe("paginate", () => {
  const items = Array.from({ length: 45 }, (_, index) => index + 1);

  it("cuts lists into pages of 20", () => {
    expect(paginate(items, 1)).toMatchObject({ page: 1, pageCount: 3, from: 1, to: 20, total: 45 });
    expect(paginate(items, 3).pageItems).toEqual([41, 42, 43, 44, 45]);
  });

  it("clamps out-of-range pages and handles empty lists", () => {
    expect(paginate(items, 9).page).toBe(3);
    expect(paginate([], 1)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0, pageItems: [] });
  });
});

describe("pageNumbers", () => {
  it("shows neighbours and gaps", () => {
    expect(pageNumbers(1, 1)).toEqual([1]);
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
    expect(pageNumbers(20, 20)).toEqual([1, "…", 19, 20]);
  });
});
