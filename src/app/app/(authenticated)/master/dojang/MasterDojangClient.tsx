// src/app/app/(authenticated)/master/dojang/MasterDojangClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import DojangFormModal, { type DojangFormValues } from "./DojangFormModal";
import {
  getDojangs,
  subscribeDojangs,
  getNextDojangId,
  addDojang,
  updateDojang,
  toggleDojangStatus,
  type Dojang,
  type DojangStatus,
} from "../_shared/dojangs";

type StatusFilter = "All" | DojangStatus;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterDojangClient() {
  const currentUserName = getCurrentUsername();

  const dojangs = useSyncExternalStore(subscribeDojangs, getDojangs, getDojangs);

  const [dojangInput, setDojangInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    dojang: string;
    status: StatusFilter;
  }>({ dojang: "", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dojang | null>(null);
  const [confirming, setConfirming] = useState<Dojang | null>(null);
  const [viewing, setViewing] = useState<Dojang | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return dojangs.filter((d) => {
      const matchName =
        applied.dojang === "" ||
        d.dojangName.toLowerCase().includes(applied.dojang.toLowerCase());
      const matchStatus =
        applied.status === "All" || d.status === applied.status;
      return matchName && matchStatus;
    });
  }, [dojangs, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedDojangs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter = applied.dojang !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ dojang: dojangInput, status: statusInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setDojangInput("");
    setStatusInput("All");
    setApplied({ dojang: "", status: "All" });
    setCurrentPage(1);
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
      updateDojang(editing.id, {
        dojangName: values.dojangName,
        image: values.image || undefined,
        updatedBy: currentUserName,
        updateDate: now,
      });
    } else {
      addDojang({
        id: getNextDojangId(),
        dojangName: values.dojangName,
        image: values.image || undefined,
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
    toggleDojangStatus(confirming.id, currentUserName);
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

      {/* filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Dojang"
            value={dojangInput}
            onChange={(e) => setDojangInput(e.target.value)}
            placeholder="e.g. Kedoya Sport Club"
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

      {/* data table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Dojang</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDojangs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No dojangs found
                  </td>
                </tr>
              ) : (
                paginatedDojangs.map((d) => {
                  const isActive = d.status === "Active";
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewing(d)}
                          className="text-ink font-medium hover:text-brand underline underline-offset-4 decoration-ink/20 hover:decoration-brand transition-colors text-left"
                        >
                          {d.dojangName}
                        </button>
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

      <DojangFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      {/* Detail popup */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.dojangName ?? ""}
        size="md"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-paper-soft border border-ink/10">
              {viewing.image ? (
                <Image
                  src={viewing.image}
                  alt={viewing.dojangName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 480px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted uppercase tracking-widest text-xs font-bold">
                  No image
                </div>
              )}
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Dojang
              </dt>
              <dd className="text-ink">{viewing.dojangName}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Status
              </dt>
              <dd className="text-ink">{viewing.status}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Updated By
              </dt>
              <dd className="text-ink">{viewing.updatedBy}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Update Date
              </dt>
              <dd className="text-ink/70">{formatDate(viewing.updateDate)}</dd>
            </dl>
          </div>
        )}
      </Modal>

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
