// src/app/app/(authenticated)/student/score/submit/[studentId]/[programMsId]/[periodId]/ScoreSubmitClient.tsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import { ApiError } from "@/lib/api/client";
import { MIN_ATTENDANCE } from "../../../../../_shared/attendance";
import {
  ensureAssessItemsLoaded,
  ensureAssessListLoaded,
  getAssessItems,
  getAssessRow,
  getScoresVersion,
  isAssessed,
  saveScore,
  scoreOptions,
  subscribeScores,
} from "../../../../../_shared/scores";

interface Props {
  studentId: number;
  programMsId: number;
  periodId: number;
}

export default function ScoreSubmitClient({
  studentId,
  programMsId,
  periodId,
}: Props) {
  const router = useRouter();
  useSyncExternalStore(subscribeScores, getScoresVersion, getScoresVersion);

  const row = getAssessRow(periodId, studentId, programMsId);
  const beltLevel = row?.BeltLevel ?? -1;

  const [scores, setScores] = useState<Record<number, number | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState("");

  useEffect(() => {
    ensureAssessListLoaded(periodId);
  }, [periodId]);
  useEffect(() => {
    if (beltLevel >= 0) ensureAssessItemsLoaded(beltLevel);
  }, [beltLevel]);

  const items = beltLevel >= 0 ? getAssessItems(beltLevel) : [];
  const attendance = row?.TotalAtd ?? 0;
  const lowAttendance =
    row?.FgLackAtd === "Y" || (row != null && attendance < MIN_ATTENDANCE);

  const viewHref = `/app/student/score/view/${studentId}/${programMsId}/${periodId}`;

  // ---- guards (after all hooks) ----
  if (!row) {
    return (
      <>
        <PageHeader title="Score Submission" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center space-y-4">
          <p className="text-muted text-sm">
            Loading… If this persists, the student is not registered for this
            period&rsquo;s exam.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isAssessed(row.TotalScore)) {
    return (
      <>
        <PageHeader title="Score Already Submitted" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center space-y-4">
          <p className="text-muted text-sm">
            Score for {row.UserName} ({row.PeriodTitle}) has already been
            submitted and cannot be edited.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" onClick={() => router.push(viewHref)}>
              View Score
            </Button>
          </div>
        </div>
      </>
    );
  }

  const setScore = (id: number, value: number) => {
    setScores((s) => ({ ...s, [id]: value }));
    setError(null);
  };

  const allFilled =
    items.length > 0 && items.every((it) => scores[it.AssessTempDtId] != null);

  const performSubmit = async (lackAtdDesc: string | null) => {
    setSubmitting(true);
    setError(null);
    try {
      await saveScore({
        studentId,
        programMsId,
        schPeriodId: periodId,
        beltMasterId: row.BeltMasterId ?? 0,
        lackAtdDesc,
        dataAssess: items.map((it) => ({
          assessTempDtId: it.AssessTempDtId,
          assessScore: scores[it.AssessTempDtId] as number,
        })),
      });
      router.push(viewHref);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan nilai.");
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (!allFilled) {
      setError("Mohon lengkapi semua nilai sebelum submit.");
      return;
    }
    if (lowAttendance) {
      setReasonModalOpen(true);
      return;
    }
    performSubmit(null);
  };

  const handleReasonContinue = () => {
    if (!reasonText.trim()) return;
    setReasonModalOpen(false);
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
        {/* Student info */}
        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            Informasi Siswa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <InfoRow label="No" value={row.UserNoId ?? "-"} />
            <InfoRow label="Periode" value={row.PeriodTitle ?? String(periodId)} />
            <InfoRow label="Nama Lengkap" value={row.UserName ?? "-"} />
            <InfoRow label="Dojang" value={row.DojangName ?? "-"} />
            <InfoRow label="Program" value={row.ProgramName ?? "-"} />
            <InfoRow label="Sabuk" value={row.BeltName ?? "-"} />
            <InfoRow
              label="Total Attendance"
              value={`${attendance} / ${MIN_ATTENDANCE}`}
              valueClassName={lowAttendance ? "text-brand font-bold" : undefined}
            />
          </div>
        </section>

        {/* Score items */}
        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-2">
            Subyek Penilaian
          </h2>
          <p className="text-xs text-muted mb-6">
            Pilih nilai untuk setiap kategori.
          </p>

          {items.length === 0 ? (
            <p className="text-sm text-muted">Loading assessment items…</p>
          ) : (
            <div className="space-y-5">
              {items.map((it) => {
                const opts = scoreOptions(it.MinScore, it.MaxScore);
                return (
                  <div key={it.AssessTempDtId}>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="font-display font-bold uppercase tracking-widest text-sm text-ink">
                        {it.AssessTitle}
                      </div>
                      <div className="text-[10px] text-muted uppercase tracking-widest">
                        {it.MinScore} – {it.MaxScore}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {opts.map((val) => {
                        const active = scores[it.AssessTempDtId] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setScore(it.AssessTempDtId, val)}
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
                );
              })}
            </div>
          )}

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
          <Button
            variant="primary"
            onClick={handleSubmitClick}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Score"}
          </Button>
        </div>
      </div>

      {/* Reason modal — attendance below the minimum */}
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
          <Button
            variant="primary"
            size="sm"
            onClick={handleReasonContinue}
            disabled={submitting}
          >
            Continue Submit
          </Button>
        </div>
      </Modal>
    </>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted min-w-[120px]">
        {label}
      </span>
      <span className={cn("text-ink", valueClassName)}>{value}</span>
    </div>
  );
}
