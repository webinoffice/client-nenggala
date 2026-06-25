// src/app/app/(authenticated)/student/score/submit/[username]/[periodId]/ScoreSubmitClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import {
  formatPeriod,
  getPeriodById,
  useAcademic,
} from "../../../../_shared/academic";
import {
  getStudentByUsername,
  type Student,
} from "../../../../_shared/students";
import { getAttendance, MIN_ATTENDANCE } from "../../../../_shared/attendance";
import {
  calculateTotal,
  determineResult,
  getScoreFor,
  isCategoryApplicable,
  SCORE_CATEGORIES,
  SCORE_OPTIONS,
  submitScoreRecord,
  type ScoreKey,
  type ScoreRecord,
} from "../../../../_shared/scores";


interface Props {
  username: string;
  periodId: string;
}

type ScoreState = Record<ScoreKey, number | null>;

const EMPTY_STATE: ScoreState = {
  agilityFisik: null,
  pomsaeWajib: null,
  pomsaePilihan: null,
  teknik: null,
  kyukpa: null,
  kyorugi: null,
  basicMovements14: null,
  teori: null,
};

export default function ScoreSubmitClient({ username, periodId }: Props) {
  const router = useRouter();
  useAcademic(); // subscribe so period labels re-render on master change/hydrate
  const [student] = useState<Student | null>(() =>
    getStudentByUsername(username),
  );
  const [alreadySubmitted] = useState(
    () => getScoreFor(username, periodId) !== null,
  );
  const [attendance] = useState(() => getAttendance(username, periodId));
  const period = getPeriodById(periodId);

  const [scores, setScores] = useState<ScoreState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);

  // Reason modal state (triggered when attendance < MIN at submit)
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState("");

  if (!student) {
    return (
      <>
        <PageHeader title="Student Not Found" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
          <p className="text-muted text-sm">No student named {username}.</p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        </div>
      </>
    );
  }
  if (alreadySubmitted) {
    return (
      <>
        <PageHeader title="Score Already Submitted" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center space-y-4">
          <p className="text-muted text-sm">
            Score for {student.namaLengkap} (Period {periodId}) has already been
            submitted and cannot be edited.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                router.push(`/app/student/score/view/${username}/${periodId}`)
              }
            >
              View Score
            </Button>
          </div>
        </div>
      </>
    );
  }

  const applicableCategories = SCORE_CATEGORIES.filter((c) =>
    isCategoryApplicable(c, student.sabuk),
  );

  const setScore = (key: ScoreKey, value: number) => {
    setScores((s) => ({ ...s, [key]: value }));
    setError(null);
  };

  const allFilled = applicableCategories.every((c) => scores[c.key] !== null);

  const performSubmit = (reasonBelowAttendance: string | null) => {
    const total = calculateTotal(scores, student.sabuk);
    const record: ScoreRecord = {
      studentUsername: username,
      periodId,
      sabukAtSubmit: student.sabuk,
      agilityFisik: scores.agilityFisik,
      pomsaeWajib: scores.pomsaeWajib,
      pomsaePilihan: scores.pomsaePilihan,
      teknik: scores.teknik,
      kyukpa: scores.kyukpa,
      kyorugi: scores.kyorugi,
      basicMovements14: scores.basicMovements14,
      teori: scores.teori,
      attendance,
      reasonBelowAttendance,
      total,
      result: determineResult(total, student.sabuk),
      submittedBy: getCurrentUsername(),
      submitDate: new Date().toISOString(),
    };
    submitScoreRecord(record);
    router.push(`/app/student/score/view/${username}/${periodId}`);
  };

  const handleSubmitClick = () => {
    if (!allFilled) {
      setError("Mohon lengkapi semua nilai sebelum submit.");
      return;
    }
    if (attendance < MIN_ATTENDANCE) {
      setReasonModalOpen(true);
      return;
    }
    performSubmit(null);
  };

  const handleReasonContinue = () => {
    if (!reasonText.trim()) {
      return; // require reason text
    }
    performSubmit(reasonText.trim());
  };

  return (
    <>
      <PageHeader
        title="Score Submission"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Student info card */}
        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            Informasi Siswa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <InfoRow label="No" value={student.username} />
            <InfoRow
              label="Periode"
              value={period ? formatPeriod(period) : periodId}
            />
            <InfoRow label="Nama Lengkap" value={student.namaLengkap} />
            <InfoRow label="Dojang" value={student.dojang} />
            <InfoRow label="Sabuk" value={student.sabuk || "-"} />
            <InfoRow
              label="Total Attendance"
              value={
                <span
                  className={cn(
                    attendance < MIN_ATTENDANCE && "text-brand font-bold",
                  )}
                >
                  {attendance} / {MIN_ATTENDANCE}
                </span>
              }
            />
          </div>
        </section>
        {/* Score categories */}
        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-2">
            Subyek Penilaian
          </h2>
          <p className="text-xs text-muted mb-6">
            Pilih nilai untuk setiap kategori (rentang 5.0 – 8.0, kelipatan 0.5)
          </p>

          <div className="space-y-5">
            {applicableCategories.map((cat) => (
              <div key={cat.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-display font-bold uppercase tracking-widest text-sm text-ink">
                    {cat.label}
                  </div>
                  {cat.conditionLabel && (
                    <div className="text-[10px] text-muted uppercase tracking-widest">
                      {cat.conditionLabel}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SCORE_OPTIONS.map((val) => {
                    const active = scores[cat.key] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setScore(cat.key, val)}
                        className={cn(
                          "min-w-[48px] px-3 py-2 rounded-sm text-sm font-display font-bold transition border",
                          active
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-paper text-ink border-ink/15 hover:bg-paper-soft",
                        )}
                      >
                        {val.toFixed(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-brand font-bold">
            *Mohon periksa kembali sebelum submit, dikarenakan data tidak bisa
            diubah.
          </p>
        </section>

        {error && (
          <div className="bg-brand/10 border border-brand/30 rounded-sm p-3 text-sm text-brand font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 pb-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitClick}>
            Submit Score
          </Button>
        </div>
      </div>

      {/* Reason modal — attendance < MIN */}
      <Modal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        title="Confirm Submission"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink">
            The attendance must be {MIN_ATTENDANCE} times or above to submit the
            score, but this student has{" "}
            <span className="text-brand font-bold">{attendance}</span>. Do you
            still want to continue submitting?
          </p>
          <div>
            <label className="block font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-1.5">
              Reason
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={4}
              placeholder="e.g. Juara 1 Lomba Nasional — alasan absen di bawah standar"
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:border-ink/40 bg-paper resize-none"
            />
            {!reasonText.trim() && (
              <p className="text-xs text-muted mt-1">
                A reason is required to override the attendance threshold.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReasonModalOpen(false)}
          >
            Later
          </Button>
          <Button variant="primary" size="sm" onClick={handleReasonContinue}>
            Continue Submit
          </Button>
        </div>
      </Modal>
    </>
  );
}
function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted min-w-[120px]">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
