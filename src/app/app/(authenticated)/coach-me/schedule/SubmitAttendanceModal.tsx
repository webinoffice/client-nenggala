// src/app/app/(authenticated)/coach-me/schedule/SubmitAttendanceModal.tsx
"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  getProgramById,
  getSubProgramById,
} from "../../student/_shared/academic";
import {
  getSessionAttendanceFor,
  getNextSessionAttendanceId,
  submitSessionAttendance,
} from "../../coach/_shared/session-attendance";
import type { Schedule } from "../../coach/_shared/schedules";
import type { Student } from "../../student/_shared/students";

interface Props {
  schedule: Schedule | null;
  onClose: () => void;
  coachUsername: string;
  coachDisplayName: string;
  studentByUsername: Map<string, Student>;
}

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SubmitAttendanceModal({
  schedule,
  onClose,
  coachUsername,
  coachDisplayName,
  studentByUsername,
}: Props) {
  const [date, setDate] = useState(today());
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  // Check if attendance for this schedule+date already exists
  const existing = useMemo(
    () => (schedule ? getSessionAttendanceFor(schedule.id, date) : null),
    [schedule, date],
  );

  // Reset state when schedule changes (new modal open)
  const scheduleId = schedule?.id ?? null;
  const [lastScheduleId, setLastScheduleId] = useState<string | null>(null);
  if (scheduleId !== lastScheduleId) {
    setLastScheduleId(scheduleId);
    setDate(today());
    setChecked(new Set());
    setSubmitted(false);
  }

  if (!schedule) {
    return (
      <Modal open={false} onClose={onClose} title="">
        <div />
      </Modal>
    );
  }

  const program = getProgramById(schedule.programId);
  const subProgram = getSubProgramById(schedule.subProgramId);

  const isReadOnly = existing !== null && !submitted;
  const displayedChecked = isReadOnly
    ? new Set(existing!.attendingStudentUsernames)
    : checked;

  const toggle = (u: string) => {
    if (isReadOnly) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
  };

  const toggleAll = () => {
    if (isReadOnly) return;
    if (checked.size === schedule.studentUsernames.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(schedule.studentUsernames));
    }
  };

  const handleSubmit = () => {
    submitSessionAttendance({
      id: getNextSessionAttendanceId(),
      scheduleId: schedule.id,
      date,
      coachUsername,
      attendingStudentUsernames: Array.from(checked),
      submittedBy: coachDisplayName,
      submitDate: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      title={
        submitted
          ? "Attendance Submitted"
          : isReadOnly
            ? "Attendance Already Submitted"
            : "Submit Attendance"
      }
      size="lg"
      footer={
        submitted ? (
          <Button variant="primary" size="sm" onClick={handleClose}>
            Done
          </Button>
        ) : isReadOnly ? (
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              Submit ({checked.size}/{schedule.studentUsernames.length})
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
          <p className="text-sm text-ink font-medium">
            Attendance saved for {date}.
          </p>
          <p className="text-xs text-muted mt-1">
            {checked.size} of {schedule.studentUsernames.length} students marked
            present.
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

          <Input
            label="Session Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isReadOnly}
            max={today()}
          />

          {isReadOnly && (
            <div className="bg-accent/10 border border-accent/30 rounded-sm p-3 text-xs text-ink/80 flex items-start gap-2">
              <AlertTriangle size={14} className="text-brand shrink-0 mt-0.5" />
              <span>
                Attendance for this date was already submitted by{" "}
                <span className="font-bold">{existing!.submittedBy}</span> on{" "}
                {new Date(existing!.submitDate).toLocaleString("id-ID")}. Pick a
                different date to submit again.
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                Students ({displayedChecked.size}/
                {schedule.studentUsernames.length} present)
              </h3>
              {!isReadOnly && (
                <button
                  onClick={toggleAll}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand hover:text-brand-hover transition"
                >
                  {checked.size === schedule.studentUsernames.length
                    ? "Uncheck All"
                    : "Check All"}
                </button>
              )}
            </div>

            <div className="border border-ink/10 rounded-sm overflow-hidden divide-y divide-ink/5 max-h-[360px] overflow-y-auto">
              {schedule.studentUsernames.length === 0 ? (
                <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
                  No students enrolled
                </div>
              ) : (
                schedule.studentUsernames.map((u) => {
                  const s = studentByUsername.get(u);
                  const isChecked = displayedChecked.has(u);
                  return (
                    <label
                      key={u}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors",
                        !isReadOnly && "hover:bg-paper-soft cursor-pointer",
                        isChecked && "bg-emerald-500/5",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(u)}
                        disabled={isReadOnly}
                        className="h-4 w-4 accent-emerald-600 cursor-pointer disabled:cursor-default"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-ink font-medium">
                          {s?.namaLengkap ?? u}
                        </div>
                        <div className="text-[11px] text-muted">
                          {u} · {s?.sabuk ?? "-"}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
