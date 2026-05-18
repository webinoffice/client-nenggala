// src/components/app/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="text-[11px] uppercase tracking-widest font-bold text-muted">
        Showing {start}–{end} of {totalItems}
      </div>
      <div className="flex items-center gap-1">
        <PageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          ariaLabel="Previous page"
        >
          <ChevronLeft size={14} />
        </PageButton>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-2 text-muted text-xs select-none"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              active={p === currentPage}
              onClick={() => onPageChange(p)}
            >
              {p}
            </PageButton>
          ),
        )}
        <PageButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          ariaLabel="Next page"
        >
          <ChevronRight size={14} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "min-w-[28px] h-7 px-2 rounded-sm text-[11px] font-bold uppercase tracking-widest transition flex items-center justify-center",
        active
          ? "bg-ink text-paper"
          : "bg-paper border border-ink/15 text-ink hover:bg-paper-soft",
        disabled && "opacity-40 cursor-not-allowed hover:bg-paper",
      )}
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: (number | "…")[] = [1];
  if (current > 3) result.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) result.push(i);
  if (current < total - 2) result.push("…");
  result.push(total);
  return result;
}
