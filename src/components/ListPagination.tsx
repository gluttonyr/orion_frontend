import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 20;

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return { page: current, pageCount, pageItems: items.slice((current - 1) * pageSize, current * pageSize), total: items.length, from: items.length ? (current - 1) * pageSize + 1 : 0, to: Math.min(current * pageSize, items.length) };
}

/** Page numbers to show, with "…" gaps: 1 … 4 5 6 … 20 */
export function pageNumbers(page: number, pageCount: number): Array<number | "…"> {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((value, index) => index && value - sorted[index - 1] > 1 ? ["…" as const, value] : [value]);
}

// shortcut: pages client-side over the full list the API returns; move to server-side paging once a list reaches thousands of rows.
// Back to page 1 whenever the list size changes (search, filters, deletion).
export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [items.length]);
  return { ...paginate(items, page), setPage };
}

export function ListPagination({ page, pageCount, total, from, to, setPage }: { page: number; pageCount: number; total: number; from: number; to: number; setPage: (page: number) => void }) {
  if (pageCount <= 1) return null;
  return <nav className="list-pagination" aria-label="Pagination">
    <span className="list-pagination-count">{from}–{to} sur {total}</span>
    <div>
      <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Page précédente"><ChevronLeft size={15} /></button>
      {pageNumbers(page, pageCount).map((value, index) => value === "…" ? <span key={`gap-${index}`} className="list-pagination-gap">…</span> : <button type="button" key={value} className={value === page ? "is-active" : ""} aria-current={value === page ? "page" : undefined} onClick={() => setPage(value)}>{value}</button>)}
      <button type="button" onClick={() => setPage(page + 1)} disabled={page === pageCount} aria-label="Page suivante"><ChevronRight size={15} /></button>
    </div>
  </nav>;
}
