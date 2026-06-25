// src/app/app/(authenticated)/master/program/MasterProgramClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import ProgramFormModal, { type ProgramFormValues } from "./ProgramFormModal";
import {
  getPrograms,
  subscribePrograms,
  getNextProgramId,
  addProgram,
  updateProgram,
  toggleProgramStatus,
  type Program,
  type ProgramStatus,
} from "../_shared/programs";

type StatusFilter = "All" | ProgramStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterProgramClient() {
  const currentUserName = getCurrentUsername();

  const programs = useSyncExternalStore(
    subscribePrograms,
    getPrograms,
    getPrograms,
  );

  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    name: string;
    status: StatusFilter;
  }>({ name: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [confirming, setConfirming] = useState<Program | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchName =
        applied.name === "" ||
        p.programName.toLowerCase().includes(applied.name.toLowerCase());
      const matchStatus =
        applied.status === "All" || p.status === applied.status;
      return matchName && matchStatus;
    });
  }, [programs, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPrograms = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter = applied.name !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ name: nameInput, status: statusInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setNameInput("");
    setStatusInput("All");
    setApplied({ name: "", status: "All" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (program: Program) => {
    setEditing(program);
    setFormOpen(true);
  };

  const handleSubmit = (values: ProgramFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      updateProgram(editing.id, {
        programName: values.programName,
        updatedBy: currentUserName,
        updateDate: now,
      });
    } else {
      addProgram({
        id: getNextProgramId(),
        programName: values.programName,
        status: "Active",
        updatedBy: currentUserName,
        updateDate: now,
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirming) return;
    toggleProgramStatus(confirming.id, currentUserName);
  };

  return (
    <>
      <PageHeader
        title="Master Program"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Program
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Taekwondo"
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
                <th className="text-left px-4 py-3.5">Program Name</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrograms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No programs found
                  </td>
                </tr>
              ) : (
                paginatedPrograms.map((p) => {
                  const isActive = p.status === "Active";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink">
                        <span className="inline-flex items-center gap-2">
                          {p.programName}
                          {p.isMain && (
                            <span className="text-[9px] font-bold uppercase tracking-widest bg-accent text-accent-foreground px-1.5 py-0.5 rounded-sm">
                              Main
                            </span>
                          )}
                        </span>
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
                            {p.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{p.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatDate(p.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          {!p.isMain && (
                            <button
                              onClick={() => setConfirming(p)}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition",
                                isActive
                                  ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                  : "bg-ink text-paper hover:bg-ink-soft",
                              )}
                            >
                              {isActive ? "Disable" : "Enable"}
                            </button>
                          )}
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

      <ProgramFormModal
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
            ? "Enable Program"
            : "Disable Program"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.programName}" (${confirming.id})? It will return to active status.`
              : `Disable "${confirming.programName}" (${confirming.id})? It will be marked inactive. Existing sub-programs are not affected.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
