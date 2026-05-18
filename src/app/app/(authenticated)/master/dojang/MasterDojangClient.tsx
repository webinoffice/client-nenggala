// src/app/app/(authenticated)/master/dojang/MasterDojangClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import DojangFormModal, { type DojangFormValues } from "./DojangFormModal";

export type DojangStatus = "Active" | "Inactive";

export type Dojang = {
  id: number;
  dojangName: string;
  status: DojangStatus;
  updatedBy: string;
  updateDate: string;
};

const INITIAL_DOJANGS: Dojang[] = [
  {
    id: 1,
    dojangName: "Kedoya Sport Club",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32",
  },
  {
    id: 2,
    dojangName: "Bintaro Dojang",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:00:00",
  },
  {
    id: 3,
    dojangName: "Pondok Indah Center",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-15T14:22:00",
  },
  {
    id: 4,
    dojangName: "Kelapa Gading Hall",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-11-30T11:30:00",
  },
  {
    id: 5,
    dojangName: "BSD Training Hall",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-15T09:00:00",
  },
  {
    id: 6,
    dojangName: "Cibubur Training Center",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-20T13:45:00",
  },
  {
    id: 7,
    dojangName: "Tangerang Branch",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-10-05T16:00:00",
  },
  {
    id: 8,
    dojangName: "Bekasi Sport Hall",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-09-10T08:30:00",
  },
];

type StatusFilter = "All" | DojangStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterDojangClient() {
  const currentUserName = "Carolina";

  const [dojangs, setDojangs] = useState<Dojang[]>(INITIAL_DOJANGS);

  const [idInput, setIdInput] = useState("");
  const [dojangInput, setDojangInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    id: string;
    dojang: string;
    status: StatusFilter;
  }>({ id: "", dojang: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dojang | null>(null);
  const [confirming, setConfirming] = useState<Dojang | null>(null);

  const filtered = useMemo(() => {
    return dojangs.filter((d) => {
      const matchId = applied.id === "" || String(d.id) === applied.id.trim();
      const matchName =
        applied.dojang === "" ||
        d.dojangName.toLowerCase().includes(applied.dojang.toLowerCase());
      const matchStatus =
        applied.status === "All" || d.status === applied.status;
      return matchId && matchName && matchStatus;
    });
  }, [dojangs, applied]);

  const hasFilter =
    applied.id !== "" || applied.dojang !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ id: idInput, dojang: dojangInput, status: statusInput });
  };

  const handleReset = () => {
    setIdInput("");
    setDojangInput("");
    setStatusInput("All");
    setApplied({ id: "", dojang: "", status: "All" });
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (dojang: Dojang) => {
    setEditing(dojang);
    setFormOpen(true);
  };

  const handleSubmit = (values: DojangFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      setDojangs((prev) =>
        prev.map((d) =>
          d.id === editing.id
            ? {
                ...d,
                dojangName: values.dojangName,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : d,
        ),
      );
    } else {
      const nextId =
        dojangs.length > 0 ? Math.max(...dojangs.map((d) => d.id)) + 1 : 1;
      setDojangs((prev) => [
        {
          id: nextId,
          dojangName: values.dojangName,
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
    setDojangs((prev) =>
      prev.map((d) =>
        d.id === confirming.id
          ? {
              ...d,
              status: d.status === "Active" ? "Inactive" : "Active",
              updatedBy: currentUserName,
              updateDate: new Date().toISOString(),
            }
          : d,
      ),
    );
  };

  return (
    <>
      <PageHeader
        title="Master Dojang"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Dojang
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
            label="Dojang"
            value={dojangInput}
            onChange={(e) => setDojangInput(e.target.value)}
            placeholder="e.g. Kedoya Sport Club"
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
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">ID</th>
                <th className="text-left px-4 py-3.5">Dojang</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No dojangs found
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const isActive = d.status === "Active";
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">{d.id}</td>
                      <td className="px-4 py-3 text-ink">{d.dojangName}</td>
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
                            {d.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{d.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatDate(d.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirming(d)}
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
      </div>

      <DojangFormModal
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
          confirming?.status === "Inactive" ? "Enable Dojang" : "Disable Dojang"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.dojangName}" (ID ${confirming.id})? It will return to active status.`
              : `Disable "${confirming.dojangName}" (ID ${confirming.id})? It will be marked inactive.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
