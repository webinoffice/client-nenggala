// src/app/app/(authenticated)/coach-me/schedule/SubmitAttendanceModal.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../../student/_shared/academic";
import { fetchScheduleDt, type ScheduleDtRow } from "@/lib/api/schedules";
import {
  fetchStudentToAtd,
  fetchCoachToAtd,
  saveAttendance,
  type StudentToAtdRow,
  type CoachToAtdRow,
} from "@/lib/api/attendance";
import type { Schedule } from "../../coach/_shared/schedules";

interface Props {
  schedule: Schedule | null;
  onClose: () => void;
}

export default function SubmitAttendanceModal({ schedule, onClose }: Props) {
  // Subscribe so program/sub-program names re-render on master change/hydrate.
  useAcademic();

  const [occurrences, setOccurrences] = useState<ScheduleDtRow[]>([]);
  const [selectedDtId, setSelectedDtId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentToAtdRow[]>([]);
  const [coaches, setCoaches] = useState<CoachToAtdRow[]>([]);
  const [studentPresent, setStudentPresent] = useState<Record<number, boolean>>(
    {},
  );
  const [coachPresent, setCoachPresent] = useState<Record<number, boolean>>({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const scheduleId = schedule?.id ?? null;

  // Load occurrences when a schedule is opened; default to the latest past date.
  // All setState happens inside the async callbacks (never synchronously in the
  // effect body) to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    if (scheduleId == null) return;
    let alive = true;
    fetchScheduleDt(scheduleId)
      .then((rows) => {
        if (!alive) return;
        const sorted = [...(rows ?? [])].sort((a, b) =>
          a.ScheduleDate.localeCompare(b.ScheduleDate),
        );
        const today = new Date().toISOString().slice(0, 10);
        const past = [...sorted].reverse().find((o) => o.ScheduleDate <= today);
        setOccurrences(sorted);
        setSubmitted(false);
        setError("");
        setLoadingRoster(true);
        setSelectedDtId((past ?? sorted[0])?.ScheduleDtId ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setOccurrences([]);
        setSelectedDtId(null);
      });
    return () => {
      alive = false;
    };
  }, [scheduleId]);

  // Load the pending roster for the selected occurrence (loadingRoster is set by
  // the triggers — the occurrences loader and the date <select>).
  useEffect(() => {
    if (selectedDtId == null) return;
    let alive = true;
    Promise.all([
      fetchStudentToAtd(selectedDtId).catch(() => []),
      fetchCoachToAtd(selectedDtId).catch(() => []),
    ])
      .then(([s, c]) => {
        if (!alive) return;
        setStudents(s ?? []);
        setCoaches(c ?? []);
        setStudentPresent(
          Object.fromEntries((s ?? []).map((r) => [r.UserDataId, true])),
        );
        setCoachPresent(
          Object.fromEntries((c ?? []).map((r) => [r.UserDataId, true])),
        );
      })
      .finally(() => {
        if (alive) setLoadingRoster(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedDtId]);

  if (!schedule) {
    return (
      <Modal open={false} onClose={onClose} title="">
        <div />
      </Modal>
    );
  }

  const program = getProgramById(schedule.programId);
  const subProgram = getSubProgramById(schedule.subProgramId);
  const alreadyRecorded =
    !loadingRoster &&
    selectedDtId != null &&
    students.length === 0 &&
    coaches.length === 0;

  const presentCount =
    students.filter((s) => studentPresent[s.UserDataId]).length +
    coaches.filter((c) => coachPresent[c.UserDataId]).length;

  const handleSubmit = async () => {
    if (selectedDtId == null) return;
    setSubmitting(true);
    setError("");
    try {
      await saveAttendance({
        ScheduleDtId: selectedDtId,
        DataAtdStudent: students.map((s) => ({
          StudentId: s.UserDataId,
          ScheduleMbrId: s.ScheduleMbrId,
          FgAtd: studentPresent[s.UserDataId] ? "Y" : "N",
        })),
        DataAtdCoach: coaches.map((c) => ({
          CoachId: c.UserDataId,
          FgAtd: coachPresent[c.UserDataId] ? "Y" : "N",
        })),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit attendance",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      title={submitted ? "Attendance Submitted" : "Submit Attendance"}
      size="lg"
      footer={
        submitted ? (
          <Button variant="primary" size="sm" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || alreadyRecorded || selectedDtId == null}
            >
              {submitting ? "Submitting…" : `Submit (${presentCount} present)`}
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <div className="text-center py-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-ink font-medium">Attendance recorded.</p>
          <p className="text-xs text-muted mt-1">
            Present attendees were saved for this session.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-paper-soft rounded-sm border border-ink/10 p-3 text-sm space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted min-w-[80px]">
                Class
              </span>
              <span className="text-ink">
                {program?.name ?? schedule.programId} ·{" "}
                {subProgram?.name ?? schedule.subProgramId}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted min-w-[80px]">
                Time
              </span>
              <span className="text-ink">
                {schedule.dayOfWeek} · {schedule.startTime} – {schedule.endTime}
              </span>
            </div>
          </div>

          <Select
            label="Session Date"
            value={selectedDtId != null ? String(selectedDtId) : ""}
            onChange={(e) => {
              setLoadingRoster(true);
              setSubmitted(false);
              setError("");
              setSelectedDtId(Number(e.target.value));
            }}
          >
            {occurrences.length === 0 && <option value="">No sessions</option>}
            {occurrences.map((o) => (
              <option key={o.ScheduleDtId} value={String(o.ScheduleDtId)}>
                {o.ScheduleDate}
                {o.FgLastDay === "Y" ? " (last day)" : ""}
              </option>
            ))}
          </Select>

          {error && (
            <div className="bg-brand/10 border border-brand/30 rounded-sm px-3 py-2 text-xs text-brand">
              {error}
            </div>
          )}

          {loadingRoster ? (
            <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
              Loading roster…
            </div>
          ) : alreadyRecorded ? (
            <div className="bg-accent/10 border border-accent/30 rounded-sm p-3 text-xs text-ink/80">
              Attendance for this session has already been recorded.
            </div>
          ) : (
            <>
              {/* Coaches */}
              {coaches.length > 0 && (
                <div>
                  <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-2">
                    Coaches
                  </h3>
                  <div className="border border-ink/10 rounded-sm overflow-hidden divide-y divide-ink/5">
                    {coaches.map((c) => (
                      <AttendeeRow
                        key={c.UserDataId}
                        name={c.UserName ?? c.UserNoId ?? ""}
                        sub={`${c.UserNoId ?? ""} · Coach`}
                        present={coachPresent[c.UserDataId] ?? true}
                        onToggle={() =>
                          setCoachPresent((p) => ({
                            ...p,
                            [c.UserDataId]: !p[c.UserDataId],
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                    Members ({students.filter((s) => studentPresent[s.UserDataId]).length}/
                    {students.length} present)
                  </h3>
                </div>
                <div className="border border-ink/10 rounded-sm overflow-hidden divide-y divide-ink/5 max-h-[360px] overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
                      No members pending
                    </div>
                  ) : (
                    students.map((s) => (
                      <AttendeeRow
                        key={s.UserDataId}
                        name={s.UserName ?? s.UserNoId ?? ""}
                        sub={s.UserNoId ?? ""}
                        present={studentPresent[s.UserDataId] ?? true}
                        onToggle={() =>
                          setStudentPresent((p) => ({
                            ...p,
                            [s.UserDataId]: !p[s.UserDataId],
                          }))
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function AttendeeRow({
  name,
  sub,
  present,
  onToggle,
}: {
  name: string;
  sub: string;
  present: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
        present ? "bg-emerald-500/5" : "hover:bg-paper-soft",
      )}
    >
      <input
        type="checkbox"
        checked={present}
        onChange={onToggle}
        className="h-4 w-4 accent-emerald-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink font-medium">{name}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
      <span
        className={cn(
          "text-[10px] uppercase tracking-widest font-bold",
          present ? "text-emerald-600" : "text-muted",
        )}
      >
        {present ? "Present" : "Absent"}
      </span>
    </label>
  );
}
