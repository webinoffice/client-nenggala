// src/app/app/(authenticated)/master/schedule-period/MasterSchedulePeriodClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import { useDojangOptions } from "../_shared/dojangs";
import SchedulePeriodFormModal, {
  type SchedulePeriodFormValues,
} from "./SchedulePeriodFormModal";
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
  getMaxSchedulePeriodId,
  addSchedulePeriods,
  updateSchedulePeriod,
  deleteSchedulePeriod,
  type SchedulePeriod,
} from "../_shared/schedule-periods";

// The logged-in admin's own dojang (real value comes from the session later).
const ADMIN_DOJANG = "Kedoya Sport Club";

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatMonth(yearMonth: string): string {
  if (!yearMonth) return "";
  const [year, month] = yearMonth.split("-");
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return yearMonth;
  return `${MONTH_NAMES_ID[idx]} ${year}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterSchedulePeriodClient() {
  const { role } = useRole();
  const isSuper = role === "super-admin";
  const currentUserName = getCurrentUsername();
  const dojangOptions = useDojangOptions();

  const periods = useSyncExternalStore(
    subscribeSchedulePeriods,
    getSchedulePeriods,
    getSchedulePeriods,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchedulePeriod | null>(null);
  const [confirming, setConfirming] = useState<SchedulePeriod | null>(null);
  const [actionError, setActionError] = useState("");
  const [dojangFilter, setDojangFilter] = useState("All");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Super-admin sees all (with an optional dojang filter); admin only sees own dojang.
  const visible = useMemo(() => {
    if (!isSuper) return periods.filter((p) => p.dojang === ADMIN_DOJANG);
    if (dojangFilter === "All") return periods;
    return periods.filter((p) => p.dojang === dojangFilter);
  }, [periods, isSuper, dojangFilter]);

  const totalItems = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPeriods = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [visible, safePage, pageSize]);

  const colCount = isSuper ? 8 : 7;

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (period: SchedulePeriod) => {
    setEditing(period);
    setFormOpen(true);
  };

  const handleSubmit = (values: SchedulePeriodFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      // Only the name and period end may change.
      updateSchedulePeriod(editing.id, {
        periodName: values.periodName,
        periodEnd: values.periodEnd,
        updatedBy: currentUserName,
        updateDate: now,
      });
    } else {
      // One record per selected dojang (admin: always own dojang).
      const baseId = getMaxSchedulePeriodId();
      const created: SchedulePeriod[] = values.dojangs.map((dojang, i) => ({
        id: baseId + 1 + i,
        periodName: values.periodName,
        dojang,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        status: "Active",
        updatedBy: currentUserName,
        updateDate: now,
      }));
      addSchedulePeriods(created);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    try {
      await deleteSchedulePeriod(target.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete period",
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Schedule Period Management"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Period
          </Button>
        }
      />

      {/* Dojang filter — super-admin only */}
      {isSuper && (
        <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-md">
            <Select
              label="Dojang"
              value={dojangFilter}
              onChange={(e) => {
                setDojangFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Dojang</option>
              {dojangOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Period Name</th>
                {isSuper && (
                  <th className="text-left px-4 py-3.5">Dojang</th>
                )}
                <th className="text-left px-4 py-3.5">Period Start</th>
                <th className="text-left px-4 py-3.5">Period End</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPeriods.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No periods yet
                  </td>
                </tr>
              ) : (
                paginatedPeriods.map((p) => {
                  const isActive = p.status === "Active";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">
                        {p.periodName}
                      </td>
                      {isSuper && (
                        <td className="px-4 py-3 text-ink/80">{p.dojang}</td>
                      )}
                      <td className="px-4 py-3 text-ink/80">
                        {formatMonth(p.periodStart)}
                      </td>
                      <td className="px-4 py-3 text-ink/80">
                        {formatMonth(p.periodEnd)}
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
                          <button
                            onClick={() => setConfirming(p)}
                            className="bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-brand-hover transition"
                          >
                            Delete
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

      <SchedulePeriodFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        isSuper={isSuper}
        adminDojang={ADMIN_DOJANG}
        dojangOptions={dojangOptions}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleDelete}
        title="Delete Period"
        description={
          confirming
            ? `Delete "${confirming.periodName}"? This cannot be undone. Periods already used by a schedule cannot be deleted.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      <Modal
        open={actionError !== ""}
        onClose={() => setActionError("")}
        title="Cannot Delete Period"
        size="sm"
      >
        <p className="text-sm text-ink/80">{actionError}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setActionError("")}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
