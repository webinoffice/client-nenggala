// src/app/app/(authenticated)/joint-training/JointTrainingAttendanceModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Search, Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  fetchMergeAtdDisplay,
  fetchMergeParticipantsToAtd,
  saveScheduleMergeAtd,
  deleteScheduleMergeAtd,
  type MergeParticipantRow,
  type ScheduleMergeHdRow,
} from "@/lib/api/schedule-merge";

interface Props {
  event: ScheduleMergeHdRow | null;
  /** Super-admin on/after the event day → may tick attendance. Others read-only. */
  editable: boolean;
  onClose: () => void;
}

function todayIso() {
  return new Date().toLocaleDateString("en-CA");
}

function typeLabel(t: string | null): string {
  if (t === "Student") return "Student";
  if (t === "Instructor") return "Coach";
  return t ?? "-";
}

export default function JointTrainingAttendanceModal({
  event,
  editable,
  onClose,
}: Props) {
  return (
    <Modal
      open={event !== null}
      onClose={onClose}
      title="Peserta Latihan Gabungan"
      size="lg"
    >
      {event && (
        <AttendanceBody
          key={event.ScheduleMergeHdId}
          event={event}
          editable={editable}
        />
      )}
    </Modal>
  );
}

function AttendanceBody({
  event,
  editable,
}: {
  event: ScheduleMergeHdRow;
  editable: boolean;
}) {
  const hdId = event.ScheduleMergeHdId;
  // The roster isn't viewable until the event day; on/after it's a checklist of
  // every active student+coach — the super-admin ticks who actually attended.
  const started = (event.ScheduleDateIso ?? "") <= todayIso();

  // Editable (super-admin): full roster + tick state. Read-only: attendees only.
  const [roster, setRoster] = useState<MergeParticipantRow[]>([]);
  const [attendees, setAttendees] = useState<MergeParticipantRow[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [baseline, setBaseline] = useState<Set<number>>(new Set());
  const [atdIdByUser, setAtdIdByUser] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // setState only inside the async callback (after await). No fetch before the
  // event day. Runs once per mount (parent keys the body by event id).
  useEffect(() => {
    if (!started) return;
    let alive = true;
    (async () => {
      if (editable) {
        const [present, absent] = await Promise.all([
          fetchMergeAtdDisplay(hdId).catch(() => [] as MergeParticipantRow[]),
          fetchMergeParticipantsToAtd(hdId).catch(
            () => [] as MergeParticipantRow[],
          ),
        ]);
        if (!alive) return;
        const presentIds = new Set((present ?? []).map((p) => p.UserDataId));
        const map = new Map(
          (present ?? [])
            .filter((p) => p.ScheduleMergeAtdId != null)
            .map((p) => [p.UserDataId, p.ScheduleMergeAtdId as number]),
        );
        const combined = [...(present ?? []), ...(absent ?? [])].sort((a, b) =>
          (a.UserName ?? "").localeCompare(b.UserName ?? ""),
        );
        setRoster(combined);
        setChecked(new Set(presentIds));
        setBaseline(new Set(presentIds));
        setAtdIdByUser(map);
        setLoading(false);
      } else {
        const present = await fetchMergeAtdDisplay(hdId).catch(
          () => [] as MergeParticipantRow[],
        );
        if (!alive) return;
        setAttendees(present ?? []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [hdId, started, editable]);

  const filteredRoster = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (r) =>
        (r.UserName ?? "").toLowerCase().includes(q) ||
        (r.UserNoId ?? "").toLowerCase().includes(q),
    );
  }, [roster, query]);

  const dirty = useMemo(() => {
    if (checked.size !== baseline.size) return true;
    for (const id of checked) if (!baseline.has(id)) return true;
    return false;
  }, [checked, baseline]);

  const toggle = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredChecked =
    filteredRoster.length > 0 &&
    filteredRoster.every((r) => checked.has(r.UserDataId));
  const toggleAllFiltered = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allFilteredChecked)
        filteredRoster.forEach((r) => next.delete(r.UserDataId));
      else filteredRoster.forEach((r) => next.add(r.UserDataId));
      return next;
    });

  const reload = async () => {
    const [present, absent] = await Promise.all([
      fetchMergeAtdDisplay(hdId),
      fetchMergeParticipantsToAtd(hdId),
    ]);
    const presentIds = new Set((present ?? []).map((p) => p.UserDataId));
    setAtdIdByUser(
      new Map(
        (present ?? [])
          .filter((p) => p.ScheduleMergeAtdId != null)
          .map((p) => [p.UserDataId, p.ScheduleMergeAtdId as number]),
      ),
    );
    setRoster(
      [...(present ?? []), ...(absent ?? [])].sort((a, b) =>
        (a.UserName ?? "").localeCompare(b.UserName ?? ""),
      ),
    );
    setChecked(new Set(presentIds));
    setBaseline(new Set(presentIds));
  };

  const handleSave = async () => {
    const toAdd = [...checked].filter((id) => !baseline.has(id));
    const toRemove = [...baseline]
      .filter((id) => !checked.has(id))
      .map((id) => atdIdByUser.get(id))
      .filter((x): x is number => x != null);
    setSaving(true);
    setError("");
    try {
      if (toAdd.length) await saveScheduleMergeAtd(hdId, toAdd);
      if (toRemove.length) await deleteScheduleMergeAtd(toRemove);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan kehadiran");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-ink/10 bg-paper-soft px-4 py-3">
        <p className="font-display font-bold uppercase tracking-wide text-ink">
          {event.ScheduleTitle}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {event.ScheduleDateStr} · {event.TimeStart}–{event.TimeEnd}
        </p>
      </div>

      {!started ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-ink/15 px-4 py-12 text-center">
          <CalendarClock size={28} className="text-muted" />
          <p className="text-sm text-ink/80 max-w-sm">
            Absensi dibuka pada hari pelaksanaan acara.
          </p>
        </div>
      ) : !editable ? (
        // Read-only: attendees only (the ticked ones).
        <div>
          <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-2">
            Peserta Hadir ({attendees.length})
          </h3>
          <div className="rounded-sm border border-ink/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <tr>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Tipe</th>
                  <th className="text-left px-3 py-2">Sabuk</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center px-3 py-6 text-muted text-xs uppercase tracking-widest font-bold"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center px-3 py-6 text-muted text-xs uppercase tracking-widest font-bold"
                    >
                      Belum ada peserta hadir
                    </td>
                  </tr>
                ) : (
                  attendees.map((p) => (
                    <tr key={p.UserDataId} className="border-t border-ink/5">
                      <td className="px-3 py-2 text-ink">
                        {p.UserName}
                        <span className="text-muted text-xs ml-1">
                          ({p.UserNoId})
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink/70">
                        {typeLabel(p.UserTypeName)}
                      </td>
                      <td className="px-3 py-2 text-ink/70">
                        {p.BeltName ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Super-admin: tick who attended.
        <div>
          {error && (
            <div className="mb-3 rounded-sm bg-brand/10 border border-brand/30 px-4 py-2.5 text-sm text-ink">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
              Centang yang hadir ({checked.size}/{roster.length})
            </h3>
            {filteredRoster.length > 0 && (
              <button
                onClick={toggleAllFiltered}
                className="text-[11px] font-bold uppercase tracking-widest text-brand hover:text-brand-hover"
              >
                {allFilteredChecked ? "Hapus semua" : "Pilih semua"}
              </button>
            )}
          </div>
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / No. Reg"
              className="pl-9"
            />
          </div>
          <div className="rounded-sm border border-ink/10 max-h-72 overflow-y-auto divide-y divide-ink/5">
            {loading ? (
              <p className="px-3 py-6 text-center text-muted text-xs uppercase tracking-widest font-bold">
                Loading…
              </p>
            ) : filteredRoster.length === 0 ? (
              <p className="px-3 py-6 text-center text-muted text-xs uppercase tracking-widest font-bold">
                Tidak ada peserta
              </p>
            ) : (
              filteredRoster.map((r) => (
                <label
                  key={r.UserDataId}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-paper-soft"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(r.UserDataId)}
                    onChange={() => toggle(r.UserDataId)}
                    className="accent-brand"
                  />
                  <span className="text-sm text-ink flex-1">
                    {r.UserName}
                    <span className="text-muted text-xs ml-1">
                      ({r.UserNoId})
                    </span>
                  </span>
                  <span className="text-ink/60 text-xs">{r.BeltName ?? "-"}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 w-14 text-right">
                    {typeLabel(r.UserTypeName)}
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              <Save size={16} />
              {saving ? "Menyimpan…" : "Simpan Kehadiran"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
