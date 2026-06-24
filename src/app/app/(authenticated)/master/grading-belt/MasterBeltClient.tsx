// src/app/app/(authenticated)/master/grading-belt/MasterBeltClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";

export type BeltStatus = "Active" | "Inactive";

export type Belt = {
  id: number;
  beltName: string;
  beltLevel: number;
  status: BeltStatus;
  updatedBy: string;
  updateDate: string;
};

const INITIAL_BELTS: Belt[] = [
  { id: 1, beltName: "Putih", beltLevel: 0, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: 2, beltName: "Kuning", beltLevel: 1, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:42:00" },
  { id: 3, beltName: "Kuning Strip", beltLevel: 2, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:43:00" },
  { id: 4, beltName: "Hijau", beltLevel: 3, status: "Active", updatedBy: "Andre", updateDate: "2025-12-20T10:00:00" },
  { id: 5, beltName: "Hijau Strip", beltLevel: 4, status: "Active", updatedBy: "Andre", updateDate: "2025-12-20T10:05:00" },
  { id: 6, beltName: "Biru", beltLevel: 5, status: "Active", updatedBy: "Carolina", updateDate: "2025-11-15T14:30:00" },
  { id: 7, beltName: "Biru Strip", beltLevel: 6, status: "Active", updatedBy: "Carolina", updateDate: "2025-11-15T14:32:00" },
  { id: 8, beltName: "Merah", beltLevel: 7, status: "Active", updatedBy: "Carolina", updateDate: "2025-10-10T09:15:00" },
  { id: 9, beltName: "Merah Strip", beltLevel: 8, status: "Active", updatedBy: "Andre", updateDate: "2025-10-10T09:18:00" },
  { id: 10, beltName: "Hitam Dan 1", beltLevel: 9, status: "Active", updatedBy: "Carolina", updateDate: "2025-09-05T11:00:00" },
  { id: 11, beltName: "Hitam Dan 2", beltLevel: 10, status: "Inactive", updatedBy: "Carolina", updateDate: "2025-09-05T11:02:00" },
];

export default function MasterBeltClient() {
  const belts = INITIAL_BELTS;

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
