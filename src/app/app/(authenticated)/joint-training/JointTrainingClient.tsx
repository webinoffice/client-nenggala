// src/app/app/(authenticated)/joint-training/JointTrainingClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Search, Pencil, Trash2, Users, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import JointTrainingFormModal, {
  type JointTrainingFormValues,
} from "./JointTrainingFormModal";
import JointTrainingAttendanceModal from "./JointTrainingAttendanceModal";
import {
  getJointTrainings,
  subscribeJointTrainings,
  reloadJointTrainings,
} from "./_shared/joint-training";
import {
  saveScheduleMergeHd,
  deleteScheduleMergeHd,
  type ScheduleMergeHdRow,
} from "@/lib/api/schedule-merge";

const PAGE_SIZE = 10;

/** Local "today" as YYYY-MM-DD (en-CA renders ISO order). */
function todayIso() {
  return new Date().toLocaleDateString("en-CA");
}

export default function JointTrainingClient() {
  const events = useSyncExternalStore(
    subscribeJointTrainings,
    getJointTrainings,
    getJointTrainings,
  );

  const [nameInput, setNameInput] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleMergeHdRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [attendanceFor, setAttendanceFor] =
    useState<ScheduleMergeHdRow | null>(null);
  const [deleting, setDeleting] = useState<ScheduleMergeHdRow | null>(null);
  const [actionError, setActionError] = useState("");

  const today = todayIso();

  const filtered = useMemo(() => {
    const q = applied.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      (e.ScheduleTitle ?? "").toLowerCase().includes(q),
    );
  }, [events, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );
  const hasFilter = applied !== "";

  const handleSearch = () => {
    setApplied(nameInput);
    setPage(1);
  };
  const handleReset = () => {
    setNameInput("");
    setApplied("");
    setPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (e: ScheduleMergeHdRow) => {
    setEditing(e);
    setFormOpen(true);
  };

  const handleSubmit = async (values: JointTrainingFormValues) => {
    setSaving(true);
    setActionError("");
    try {
      await saveScheduleMergeHd(
        {
          ScheduleMergeHdId: editing?.ScheduleMergeHdId ?? 0,
          ScheduleTitle: values.title,
          ScheduleDate: values.date,
          TimeStart: values.timeStart,
          TimeEnd: values.timeEnd,
          ScheduleDesc: values.description,
          FgFeatured: values.featured ? "Y" : "N",
          FgMode: editing ? "E" : "I",
        },
        values.image,
      );
      await reloadJointTrainings();
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await deleteScheduleMergeHd(target.ScheduleMergeHdId);
      await reloadJointTrainings();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  return (
    <>
      <PageHeader
        title="Latihan Gabungan"
        description="Acara latihan gabungan lintas dojang."
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Tambah
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-xl">
          <Input
            label="Judul"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Cari judul acara"
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
                <th className="text-left px-4 py-3.5 whitespace-nowrap">Aksi</th>
                <th className="text-left px-4 py-3.5">Judul</th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">Tanggal</th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">Waktu</th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    {hasFilter ? "Tidak ada hasil" : "Belum ada latihan gabungan"}
                  </td>
                </tr>
              ) : (
                paginated.map((e) => {
                  const editable = (e.ScheduleDateIso ?? "") <= today;
                  return (
                    <tr
                      key={e.ScheduleMergeHdId}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(e)}
                            title="Edit"
                            className="bg-accent text-accent-foreground p-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setAttendanceFor(e)}
                            title={
                              editable
                                ? "Kelola peserta"
                                : "Daftar peserta tersedia pada hari pelaksanaan"
                            }
                            className="bg-ink text-paper p-1.5 rounded-sm hover:bg-ink-soft transition"
                          >
                            <Users size={14} />
                          </button>
                          <button
                            onClick={() => setDeleting(e)}
                            title="Hapus"
                            className="bg-brand text-brand-foreground p-1.5 rounded-sm hover:bg-brand-hover transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {e.ScheduleTitle}
                        {e.FgFeatured === "Y" && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider align-middle">
                            <Star size={10} />
                            Sorotan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink/80 whitespace-nowrap">
                        {e.ScheduleDateStr}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {e.TimeStart}–{e.TimeEnd}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {e.UpdatedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-ink/10 px-4 py-3 bg-paper-soft">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <JointTrainingFormModal
        open={formOpen}
        initial={editing}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <JointTrainingAttendanceModal
        event={attendanceFor}
        editable={
          attendanceFor ? (attendanceFor.ScheduleDateIso ?? "") <= today : false
        }
        onClose={() => setAttendanceFor(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Hapus Latihan Gabungan"
        description={
          deleting
            ? `Hapus "${deleting.ScheduleTitle}"? Tindakan ini tidak dapat dibatalkan. Daftar peserta acara ini juga akan terhapus.`
            : ""
        }
        confirmLabel="Hapus"
        variant="destructive"
      />

      <Modal
        open={actionError !== ""}
        onClose={() => setActionError("")}
        title="Gagal"
        size="sm"
      >
        <p className="text-sm text-ink/80">{actionError}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setActionError("")}>
            Tutup
          </Button>
        </div>
      </Modal>
    </>
  );
}
