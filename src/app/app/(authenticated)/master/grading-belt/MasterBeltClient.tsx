// src/app/app/(authenticated)/master/grading-belt/MasterBeltClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import BeltFormModal, { type BeltFormValues } from "./BeltFormModal";

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
  {
    id: 1,
    beltName: "Putih",
    beltLevel: 0,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32",
  },
  {
    id: 2,
    beltName: "Kuning",
    beltLevel: 1,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:42:00",
  },
  {
    id: 3,
    beltName: "Kuning Strip",
    beltLevel: 2,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:43:00",
  },
  {
    id: 4,
    beltName: "Hijau",
    beltLevel: 3,
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-20T10:00:00",
  },
  {
    id: 5,
    beltName: "Hijau Strip",
    beltLevel: 4,
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-20T10:05:00",
  },
  {
    id: 6,
    beltName: "Biru",
    beltLevel: 5,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-15T14:30:00",
  },
  {
    id: 7,
    beltName: "Biru Strip",
    beltLevel: 6,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-15T14:32:00",
  },
  {
    id: 8,
    beltName: "Merah",
    beltLevel: 7,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-10T09:15:00",
  },
  {
    id: 9,
    beltName: "Merah Strip",
    beltLevel: 8,
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-10-10T09:18:00",
  },
  {
    id: 10,
    beltName: "Hitam Dan 1",
    beltLevel: 9,
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-09-05T11:00:00",
  },
  {
    id: 11,
    beltName: "Hitam Dan 2",
    beltLevel: 10,
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-09-05T11:02:00",
  },
];

type StatusFilter = "All" | BeltStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterBeltClient() {
  const currentUserName = "Carolina";

  const [belts, setBelts] = useState<Belt[]>(INITIAL_BELTS);

  const [idInput, setIdInput] = useState("");
  const [beltInput, setBeltInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    id: string;
    belt: string;
    status: StatusFilter;
  }>({ id: "", belt: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Belt | null>(null);
  const [confirming, setConfirming] = useState<Belt | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return belts.filter((b) => {
      const matchId = applied.id === "" || String(b.id) === applied.id.trim();
      const matchName =
        applied.belt === "" ||
        b.beltName.toLowerCase().includes(applied.belt.toLowerCase());
      const matchStatus =
        applied.status === "All" || b.status === applied.status;
      return matchId && matchName && matchStatus;
    });
  }, [belts, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedBelts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter =
    applied.id !== "" || applied.belt !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ id: idInput, belt: beltInput, status: statusInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setIdInput("");
    setBeltInput("");
    setStatusInput("All");
    setApplied({ id: "", belt: "", status: "All" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (belt: Belt) => {
    setEditing(belt);
    setFormOpen(true);
  };

  const handleSubmit = (values: BeltFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      setBelts((prev) =>
        prev.map((b) =>
          b.id === editing.id
            ? {
                ...b,
                beltName: values.beltName,
                beltLevel: values.beltLevel,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : b,
        ),
      );
    } else {
      const nextId =
        belts.length > 0 ? Math.max(...belts.map((b) => b.id)) + 1 : 1;
      setBelts((prev) => [
        {
          id: nextId,
          beltName: values.beltName,
          beltLevel: values.beltLevel,
          status: "Active",
          updatedBy: currentUserName,
          updateDate: now,
        },
        ...prev,
      ]);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirming) return;
    setBelts((prev) =>
      prev.map((b) =>
        b.id === confirming.id
          ? {
              ...b,
              status: b.status === "Active" ? "Inactive" : "Active",
              updatedBy: currentUserName,
              updateDate: new Date().toISOString(),
            }
          : b,
      ),
    );
  };

  return (
    <>
      <PageHeader
        title="Master Belt"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Belt
          </Button>
        }
      />

      {/* Filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            placeholder="e.g. 1"
            inputMode="numeric"
          />
          <Select
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as StatusFilter)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <Input
            label="Belt"
            value={beltInput}
            onChange={(e) => setBeltInput(e.target.value)}
            placeholder="e.g. Putih"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          {hasFilter && (
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
                <th className="text-left px-4 py-3.5">ID</th>
                <th className="text-left px-4 py-3.5">Belt Name</th>
                <th className="text-left px-4 py-3.5">Belt Level</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBelts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No belts found
                  </td>
                </tr>
              ) : (
                paginatedBelts.map((b) => {
                  const isActive = b.status === "Active";
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">{b.id}</td>
                      <td className="px-4 py-3 text-ink">{b.beltName}</td>
                      <td className="px-4 py-3 text-ink/70">{b.beltLevel}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive
                                ? "bg-emerald-500"
                                : "bg-muted-foreground",
                            )}
                          />
                          <span
                            className={isActive ? "text-ink" : "text-muted"}
                          >
                            {b.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{b.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatDate(b.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(b)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirming(b)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition",
                              isActive
                                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                : "bg-ink text-paper hover:bg-ink-soft",
                            )}
                          >
                            {isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      <BeltFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleToggleStatus}
        title={
          confirming?.status === "Inactive" ? "Enable Belt" : "Disable Belt"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.beltName}" (ID ${confirming.id})? It will return to active status.`
              : `Disable "${confirming.beltName}" (ID ${confirming.id})? It will be marked inactive.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
