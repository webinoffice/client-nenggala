// src/app/app/(authenticated)/master/sub-program/MasterSubProgramClient.tsx
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
import SubProgramFormModal, {
  type SubProgramFormValues,
} from "./SubProgramFormModal";
import { INITIAL_PROGRAMS } from "../_shared/programs";

export type SubProgramStatus = "Active" | "Inactive";

export type SubProgram = {
  programId: string;
  subProgramId: string;
  subProgramName: string;
  image: string;
  status: SubProgramStatus;
  updatedBy: string;
  updateDate: string;
};

const INITIAL_SUB_PROGRAMS: SubProgram[] = [
  {
    programId: "TKD",
    subProgramId: "TKD-01",
    subProgramName: "Kyorugi",
    image: "127828916.JPG",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-26T19:41:32",
  },
  {
    programId: "TKD",
    subProgramId: "TKD-02",
    subProgramName: "Poomsae",
    image: "TKD02_pose.JPG",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-25T10:00:00",
  },
  {
    programId: "TKD",
    subProgramId: "TKD-03",
    subProgramName: "Hosinsool",
    image: "TKD03_defense.JPG",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-20T14:00:00",
  },
  {
    programId: "TKD",
    subProgramId: "TKD-04",
    subProgramName: "Breaking",
    image: "TKD04_break.JPG",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-18T11:00:00",
  },
  {
    programId: "TGD",
    subProgramId: "TGD-01",
    subProgramName: "Forms",
    image: "TGD01_form.JPG",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-10T09:00:00",
  },
  {
    programId: "HKD",
    subProgramId: "HKD-01",
    subProgramName: "Throws",
    image: "HKD01_throw.JPG",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-10-20T13:00:00",
  },
  {
    programId: "KRT",
    subProgramId: "KRT-01",
    subProgramName: "Kata",
    image: "KRT01_kata.JPG",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-09-15T08:00:00",
  },
  {
    programId: "KRT",
    subProgramId: "KRT-02",
    subProgramName: "Kumite",
    image: "KRT02_kumite.JPG",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-09-15T08:05:00",
  },
];

type StatusFilter = "All" | SubProgramStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterSubProgramClient() {
  const currentUserName = "Carolina";

  const [subPrograms, setSubPrograms] =
    useState<SubProgram[]>(INITIAL_SUB_PROGRAMS);

  const [programFilter, setProgramFilter] = useState<string>("All");
  const [subIdInput, setSubIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    programId: string;
    subId: string;
    name: string;
    status: StatusFilter;
  }>({ programId: "All", subId: "", name: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubProgram | null>(null);
  const [confirming, setConfirming] = useState<SubProgram | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return subPrograms.filter((sp) => {
      const matchProgram =
        applied.programId === "All" || sp.programId === applied.programId;
      const matchSubId =
        applied.subId === "" ||
        sp.subProgramId
          .toLowerCase()
          .includes(applied.subId.toLowerCase().trim());
      const matchName =
        applied.name === "" ||
        sp.subProgramName.toLowerCase().includes(applied.name.toLowerCase());
      const matchStatus =
        applied.status === "All" || sp.status === applied.status;
      return matchProgram && matchSubId && matchName && matchStatus;
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
    applied.subId !== "" ||
    applied.name !== "" ||
    applied.status !== "All";

  const handleSearch = () => {
    setApplied({
      programId: programFilter,
      subId: subIdInput,
      name: nameInput,
      status: statusInput,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setProgramFilter("All");
    setSubIdInput("");
    setNameInput("");
    setStatusInput("All");
    setApplied({ programId: "All", subId: "", name: "", status: "All" });
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
    const now = new Date().toISOString();
    if (editing) {
      setSubPrograms((prev) =>
        prev.map((sp) =>
          sp.subProgramId === editing.subProgramId
            ? {
                ...sp,
                programId: values.programId,
                subProgramName: values.subProgramName,
                image: values.image,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : sp,
        ),
      );
    } else {
      setSubPrograms((prev) => [
        {
          programId: values.programId,
          subProgramId: values.subProgramId,
          subProgramName: values.subProgramName,
          image: values.image,
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
    setSubPrograms((prev) =>
      prev.map((sp) =>
        sp.subProgramId === confirming.subProgramId
          ? {
              ...sp,
              status: sp.status === "Active" ? "Inactive" : "Active",
              updatedBy: currentUserName,
              updateDate: new Date().toISOString(),
            }
          : sp,
      ),
    );
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
            {INITIAL_PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.programName}
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
            label="Sub-ID"
            value={subIdInput}
            onChange={(e) => setSubIdInput(e.target.value)}
            placeholder="e.g. TKD-01"
          />
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
                <th className="text-left px-4 py-3.5">Program ID</th>
                <th className="text-left px-4 py-3.5">Sub-Program ID</th>
                <th className="text-left px-4 py-3.5">Sub-Program Name</th>
                <th className="text-left px-4 py-3.5">Image</th>
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
                    colSpan={8}
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
                        {sp.programId}
                      </td>
                      <td className="px-4 py-3 text-ink font-medium">
                        {sp.subProgramId}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {sp.subProgramName}
                      </td>
                      <td className="px-4 py-3 text-ink/70">{sp.image}</td>
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
        existingSubIds={subPrograms.map((sp) => sp.subProgramId)}
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
