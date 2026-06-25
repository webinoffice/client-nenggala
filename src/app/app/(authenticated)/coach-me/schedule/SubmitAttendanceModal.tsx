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
  useAcademic,
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
  // Subscribe so program/sub-program names re-render on master change/hydrate.
  useAcademic();
  const [date, setDate] = useState(today());
  // Coach's own attendance — the only toggle; members are always present.
  const [coachPresent, setCoachPresent] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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
    setCoachPresent(true);
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
  // Members are always counted present; submission can't uncheck them.
  const presentStudents = isReadOnly
    ? existing!.attendingStudentUsernames
    : schedule.studentUsernames;
  const coachAttended = isReadOnly ? existing!.coachAttended ?? false : coachPresent;

  const handleSubmit = () => {
    submitSessionAttendance({
      id: getNextSessionAttendanceId(),
      scheduleId: schedule.id,
      date,
      coachUsername,
      coachAttended: coachPresent,
      attendingStudentUsernames: [...schedule.studentUsernames],
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
              Submit ({schedule.studentUsernames.length}/
              {schedule.studentUsernames.length})
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
            All {schedule.studentUsernames.length} members marked present
            {coachPresent ? " · coach attended" : ""}.
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

          {/* Coach's own attendance */}
          <label
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-colors",
              coachAttended
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-ink/10",
              !isReadOnly && "cursor-pointer hover:bg-paper-soft",
            )}
          >
            <input
              type="checkbox"
              checked={coachAttended}
              onChange={(e) => setCoachPresent(e.target.checked)}
              disabled={isReadOnly}
              className="h-4 w-4 accent-emerald-600 cursor-pointer disabled:cursor-default"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-ink font-medium">
                {coachDisplayName}
              </div>
              <div className="text-[11px] text-muted">
                Coach attendance · {coachUsername}
              </div>
            </div>
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                Members ({presentStudents.length}/
                {schedule.studentUsernames.length} present)
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
                All present
              </span>
            </div>

            <div className="border border-ink/10 rounded-sm overflow-hidden divide-y divide-ink/5 max-h-[360px] overflow-y-auto">
              {schedule.studentUsernames.length === 0 ? (
                <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
                  No members enrolled
                </div>
              ) : (
                schedule.studentUsernames.map((u) => {
                  const s = studentByUsername.get(u);
                  return (
                    <label
                      key={u}
                      className="flex items-center gap-3 px-3 py-2.5 bg-emerald-500/5"
                    >
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="h-4 w-4 accent-emerald-600 cursor-default"
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
