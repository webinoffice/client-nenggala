// src/app/app/(authenticated)/master/grading-belt/MasterBeltClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import { getBelts, subscribeBelts } from "../_shared/belts";

export default function MasterBeltClient() {
  const belts = useSyncExternalStore(subscribeBelts, getBelts, getBelts);

  const [beltInput, setBeltInput] = useState("");
  const [applied, setApplied] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return belts
      .filter(
        (b) =>
          applied === "" ||
          b.beltName.toLowerCase().includes(applied.toLowerCase()),
      )
      .sort((a, b) => a.beltLevel - b.beltLevel);
  }, [belts, applied]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedBelts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleSearch = () => {
    setApplied(beltInput);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setBeltInput("");
    setApplied("");
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader
        title="Master Belt"
        description="Daftar tingkatan sabuk (view only)."
      />

      {/* Filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Belt"
            value={beltInput}
            onChange={(e) => setBeltInput(e.target.value)}
            placeholder="e.g. Putih"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          {applied !== "" && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button variant="secondary" onClick={handleSearch}>
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Belt Name</th>
                <th className="text-left px-4 py-3.5">Belt Level</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBelts.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No belts found
                  </td>
                </tr>
              ) : (
                paginatedBelts.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink">{b.beltName}</td>
                    <td className="px-4 py-3 text-ink/70">{b.beltLevel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination footer */}
        {totalItems > 0 && (
          <div className="px-4 py-4 border-t border-ink/10 bg-paper">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
