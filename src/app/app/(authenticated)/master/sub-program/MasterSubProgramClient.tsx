// src/app/app/(authenticated)/master/sub-program/MasterSubProgramClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import SubProgramFormModal, {
  type SubProgramFormValues,
} from "./SubProgramFormModal";
import { getPrograms, subscribePrograms } from "../_shared/programs";
import {
  getSubPrograms,
  subscribeSubPrograms,
  addSubProgram,
  updateSubProgram,
  toggleSubProgramStatus,
  type SubProgram,
  type SubProgramStatus,
} from "../_shared/sub-programs";

type StatusFilter = "All" | SubProgramStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterSubProgramClient() {
  const subPrograms = useSyncExternalStore(
    subscribeSubPrograms,
    getSubPrograms,
    getSubPrograms,
  );
  const programs = useSyncExternalStore(
    subscribePrograms,
    getPrograms,
    getPrograms,
  );

  const programNameById = useMemo(
    () => new Map(programs.map((p) => [p.id, p.programName])),
    [programs],
  );

  const [programFilter, setProgramFilter] = useState<string>("All");
  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    programId: string;
    name: string;
    status: StatusFilter;
  }>({ programId: "All", name: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubProgram | null>(null);
  const [confirming, setConfirming] = useState<SubProgram | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return subPrograms.filter((sp) => {
      const matchProgram =
        applied.programId === "All" ||
        String(sp.programId) === applied.programId;
      const matchName =
        applied.name === "" ||
        sp.subProgramName.toLowerCase().includes(applied.name.toLowerCase());
      const matchStatus =
        applied.status === "All" || sp.status === applied.status;
      return matchProgram && matchName && matchStatus;
    });
  }, [subPrograms, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedSubPrograms = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter =
    applied.programId !== "All" ||
    applied.name !== "" ||
    applied.status !== "All";

  const handleSearch = () => {
    setApplied({
      programId: programFilter,
      name: nameInput,
      status: statusInput,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setProgramFilter("All");
    setNameInput("");
    setStatusInput("All");
    setApplied({ programId: "All", name: "", status: "All" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (sp: SubProgram) => {
    setEditing(sp);
    setFormOpen(true);
  };

  const handleSubmit = (values: SubProgramFormValues) => {
    if (editing) {
      updateSubProgram(
        editing.subProgramId,
        values.programId,
        values.subProgramName,
        values.imageFile,
      );
    } else {
      addSubProgram(values.programId, values.subProgramName, values.imageFile);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirming) return;
    toggleSubProgramStatus(confirming.subProgramId, confirming.status);
  };

  return (
    <>
      <PageHeader
        title="Master Sub Program"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Sub Program
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Select
            label="Program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="All">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.programName}
              </option>
            ))}
          </Select>
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
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Kyorugi"
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

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Program</th>
                <th className="text-left px-4 py-3.5">Sub-Program Name</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubPrograms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No sub-programs found
                  </td>
                </tr>
              ) : (
                paginatedSubPrograms.map((sp) => {
                  const isActive = sp.status === "Active";
                  return (
                    <tr
                      key={sp.subProgramId}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">
                        {programNameById.get(sp.programId) ?? sp.programId}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {sp.subProgramName}
                      </td>
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
                            {sp.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{sp.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatDate(sp.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sp)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirming(sp)}
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

      <SubProgramFormModal
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
          confirming?.status === "Inactive"
            ? "Enable Sub Program"
            : "Disable Sub Program"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.subProgramName}" (${confirming.subProgramId})? It will return to active status.`
              : `Disable "${confirming.subProgramName}" (${confirming.subProgramId})? It will be marked inactive.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
