// src/app/app/(authenticated)/student/data/AdminExamRegisterModal.tsx
//
// Admin manual exam registration (Step 3d flow B — cash payment). Launched from
// the Student Data "Ikut Ujian" action. The admin picks a period; we resolve the
// student's eligibility + MAIN program via get-student-to-exam (which already
// excludes already-registered students and non-main programs), then register via
// save-bulk-exam (no payment file). Eligibility is fetched in the Select's change
// handler — deliberately NOT in an effect — to avoid set-state-in-effect.
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { ApiError } from "@/lib/api/client";
import {
  fetchStudentToExam,
  saveBulkExam,
  type StudentToExamRow,
} from "@/lib/api/assessment";
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
} from "../../master/_shared/schedule-periods";
import type { Student } from "../_shared/students";

interface Props {
  student: Student | null;
  onClose: () => void;
}

export default function AdminExamRegisterModal({ student, onClose }: Props) {
  const periods = useSyncExternalStore(
    subscribeSchedulePeriods,
    getSchedulePeriods,
    getSchedulePeriods,
  );

  const [periodId, setPeriodId] = useState(0);
  const [checking, setChecking] = useState(false);
  const [eligible, setEligible] = useState<StudentToExamRow | null>(null);
  const [notEligible, setNotEligible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Periods are dojang-specific and get-student-to-exam joins on the student's
  // own dojang, so only that dojang's periods can yield a registration.
  const periodOptions = useMemo(
    () => (student ? periods.filter((p) => p.dojang === student.dojang) : []),
    [periods, student],
  );

  const reset = () => {
    setPeriodId(0);
    setChecking(false);
    setEligible(null);
    setNotEligible(false);
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handlePeriodChange = async (id: number) => {
    setPeriodId(id);
    setEligible(null);
    setNotEligible(false);
    setSubmitted(false);
    setError(null);
    if (!student || id === 0) return;
    setChecking(true);
    try {
      const rows = await fetchStudentToExam(id);
      const row = rows.find((r) => r.StudentNoId === student.username) ?? null;
      setEligible(row);
      setNotEligible(row === null);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Gagal memeriksa kelayakan ujian.",
      );
    } finally {
      setChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!eligible) return;
    setSubmitting(true);
    setError(null);
    try {
      await saveBulkExam({
        SchPeriodId: periodId,
        ProgramMsId: eligible.ProgramMsId,
        DataExam: [{ StudentId: eligible.StudentId }],
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Gagal mendaftarkan ujian.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={student !== null}
      onClose={handleClose}
      title={submitted ? "Registered for Exam" : "Daftar Ujian (Manual)"}
      size="md"
      footer={
        submitted ? (
          <Button variant="primary" size="sm" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRegister}
              disabled={!eligible || submitting}
            >
              {submitting ? "Registering…" : "Register (Cash)"}
            </Button>
          </>
        )
      }
    >
      {!student ? null : submitted ? (
        <div className="text-center py-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-ink font-medium">
            {student.namaLengkap} has been registered for the exam.
          </p>
          <p className="text-xs text-muted mt-1">
            They now appear in Score Management for this period.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-paper-soft rounded-sm border border-ink/10 p-4 space-y-2">
            <InfoRow label="No. Reg" value={student.username} />
            <InfoRow label="Nama" value={student.namaLengkap} />
            <InfoRow label="Dojang" value={student.dojang} />
          </div>

          <div>
            <Select
              label="Period"
              value={String(periodId)}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
            >
              <option value="0">Pilih period…</option>
              {periodOptions.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.periodName} ({p.periodStart} – {p.periodEnd})
                </option>
              ))}
            </Select>
            {periodOptions.length === 0 && (
              <p className="text-xs text-muted mt-1">
                No periods for this student&rsquo;s dojang.
              </p>
            )}
          </div>

          {checking && (
            <p className="text-xs text-muted uppercase tracking-widest font-bold">
              Checking eligibility…
            </p>
          )}

          {eligible && (
            <div className="bg-paper-soft rounded-sm border border-ink/10 p-4 space-y-2">
              <InfoRow label="Program" value={eligible.ProgramName ?? "-"} />
              <InfoRow label="Belt" value={eligible.BeltName ?? "-"} />
              <p className="text-[11px] text-muted pt-1">
                Cash registration — no payment proof is uploaded.
              </p>
            </div>
          )}

          {notEligible && (
            <div className="flex items-start gap-2 bg-accent/10 border border-accent/30 rounded-sm p-3 text-xs text-ink/80">
              <Info size={14} className="text-ink mt-0.5 shrink-0" />
              <span>
                This student is already registered for this period, or has no
                main-program class here. Nothing to register.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-brand/10 border border-brand/30 rounded-sm p-3 text-sm text-brand font-medium">
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
      <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
