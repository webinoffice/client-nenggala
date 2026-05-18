// src/app/app/(authenticated)/master/schedule-period/MasterSchedulePeriodClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import SchedulePeriodFormModal, {
  type SchedulePeriodFormValues,
} from "./SchedulePeriodFormModal";

export type SchedulePeriodStatus = "Active" | "Inactive";

export type SchedulePeriod = {
  id: number;
  periodName: string;
  periodStart: string; // YYYY-MM
  periodEnd: string; // YYYY-MM
  status: SchedulePeriodStatus;
  updatedBy: string;
  updateDate: string;
};

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

const INITIAL_PERIODS: SchedulePeriod[] = [
  {
    id: 1,
    periodName: "Period 32",
    periodStart: "2026-01",
    periodEnd: "2026-06",
    status: "Active",
    updatedBy: "Jordan Kusuma",
    updateDate: "2026-01-01T14:30:00",
  },
  {
    id: 2,
    periodName: "Period 33",
    periodStart: "2026-07",
    periodEnd: "2026-12",
    status: "Active",
    updatedBy: "Jordan Kusuma",
    updateDate: "2026-01-01T14:30:00",
  },
  {
    id: 3,
    periodName: "Period 31",
    periodStart: "2025-07",
    periodEnd: "2025-12",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-06-15T10:00:00",
  },
  {
    id: 4,
    periodName: "Period 30",
    periodStart: "2025-01",
    periodEnd: "2025-06",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2024-12-20T11:00:00",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterSchedulePeriodClient() {
  const currentUserName = "Carolina";

  const [periods, setPeriods] = useState<SchedulePeriod[]>(INITIAL_PERIODS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchedulePeriod | null>(null);
  const [confirming, setConfirming] = useState<SchedulePeriod | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // derived pagination values
  const totalItems = periods.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPeriods = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return periods.slice(start, start + pageSize);
  }, [periods, safePage, pageSize]);

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
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                periodName: values.periodName,
                periodStart: values.periodStart,
                periodEnd: values.periodEnd,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : p,
        ),
      );
    } else {
      const nextId =
        periods.length > 0 ? Math.max(...periods.map((p) => p.id)) + 1 : 1;
      setPeriods((prev) => [
        {
          id: nextId,
          periodName: values.periodName,
          periodStart: values.periodStart,
          periodEnd: values.periodEnd,
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
    setPeriods((prev) =>
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
        title="Schedule Period Management"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Period
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Period Name</th>
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
                    colSpan={7}
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

      <SchedulePeriodFormModal
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
          confirming?.status === "Inactive" ? "Enable Period" : "Disable Period"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.periodName}"? It will return to active status.`
              : `Disable "${confirming.periodName}"? Existing schedules under this period are not affected.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
