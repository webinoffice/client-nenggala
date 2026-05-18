// src/app/app/(authenticated)/master/program/MasterProgramClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import ProgramFormModal, { type ProgramFormValues } from "./ProgramFormModal";
import {
  INITIAL_PROGRAMS,
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
  const currentUserName = "Carolina";

  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);

  const [idInput, setIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    id: string;
    name: string;
    status: StatusFilter;
  }>({ id: "", name: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [confirming, setConfirming] = useState<Program | null>(null);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchId =
        applied.id === "" ||
        p.id.toLowerCase().includes(applied.id.toLowerCase().trim());
      const matchName =
        applied.name === "" ||
        p.programName.toLowerCase().includes(applied.name.toLowerCase());
      const matchStatus =
        applied.status === "All" || p.status === applied.status;
      return matchId && matchName && matchStatus;
    });
  }, [programs, applied]);

  const hasFilter =
    applied.id !== "" || applied.name !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ id: idInput, name: nameInput, status: statusInput });
  };

  const handleReset = () => {
    setIdInput("");
    setNameInput("");
    setStatusInput("All");
    setApplied({ id: "", name: "", status: "All" });
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
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                programName: values.programName,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : p,
        ),
      );
    } else {
      setPrograms((prev) => [
        {
          id: values.id,
          programName: values.programName,
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
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === confirming.id
          ? {
              ...p,
              status: p.status === "Active" ? "Inactive" : "Active",
              updatedBy: currentUserName,
              updateDate: new Date().toISOString(),
            }
          : p,
      ),
    );
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
            label="ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            placeholder="e.g. TKD"
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
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Taekwondo"
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

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">ID</th>
                <th className="text-left px-4 py-3.5">Program Name</th>
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
                    No programs found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isActive = p.status === "Active";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">{p.id}</td>
                      <td className="px-4 py-3 text-ink">{p.programName}</td>
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

      <ProgramFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        existingIds={programs.map((p) => p.id)}
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
