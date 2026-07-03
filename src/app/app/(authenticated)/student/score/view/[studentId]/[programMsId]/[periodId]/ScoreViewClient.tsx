// src/app/app/(authenticated)/student/score/view/[studentId]/[programMsId]/[periodId]/ScoreViewClient.tsx
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/app/PageHeader";
import { MIN_ATTENDANCE } from "../../../../../_shared/attendance";
import {
  ensureAssessListLoaded,
  ensureAssessResultLoaded,
  getAssessResultFor,
  getAssessRow,
  getScoresVersion,
  passPercentage,
  resultLabel,
  subscribeScores,
} from "../../../../../_shared/scores";

interface Props {
  studentId: number;
  programMsId: number;
  periodId: number;
}

export default function ScoreViewClient({
  studentId,
  programMsId,
  periodId,
}: Props) {
  const router = useRouter();
  useSyncExternalStore(subscribeScores, getScoresVersion, getScoresVersion);

  useEffect(() => {
    ensureAssessListLoaded(periodId);
    ensureAssessResultLoaded(studentId, programMsId, periodId);
  }, [studentId, programMsId, periodId]);

  const row = getAssessRow(periodId, studentId, programMsId);
  const results = getAssessResultFor(studentId, programMsId, periodId);

  if (!row || results.length === 0) {
    return (
      <>
        <PageHeader title="Score Detail" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center space-y-4">
          <p className="text-muted text-sm">
            {row
              ? "Loading score… If this persists, no score has been submitted yet."
              : "Loading…"}
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

  const lowAttendance =
    row.FgLackAtd === "Y" || row.TotalAtd < MIN_ATTENDANCE;
  const result = resultLabel(row.TotalScore, row.MaxScore, row.BeltMasterId);
  // Final score = raw total normalised to a 0–100 scale (curr / max × 100), the
  // value the pass threshold (BeltPassScore) is compared against.
  const finalScore = passPercentage(row.TotalScore, row.MaxScore);

  // Two visual columns (figma layout).
  const half = Math.ceil(results.length / 2);
  const leftCol = results.slice(0, half);
  const rightCol = results.slice(half);

  const renderItem = (it: (typeof results)[number]) => (
    <div
      key={it.AssessTempDtId}
      className="flex items-baseline justify-between py-2 border-b border-ink/5"
    >
      <div className="text-sm text-ink">{it.AssessTitle}</div>
      <div className="font-display font-bold text-lg text-ink">
        {it.AssessScore.toFixed(1)}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Score Detail"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="space-y-6">
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
          </div>
        </section>

        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            Subyek Penilaian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>{leftCol.map(renderItem)}</div>
            <div>{rightCol.map(renderItem)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-2">
            <div className="flex items-baseline justify-between py-2 border-b border-ink/5">
              <div className="text-sm text-ink flex items-center gap-1.5">
                Absen
                {lowAttendance && row.LackAtdDesc && (
                  <span
                    className="relative inline-flex group cursor-help"
                    title={row.LackAtdDesc}
                  >
                    <Info size={14} className="text-brand" />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 hidden group-hover:block z-10 bg-ink text-paper text-xs rounded-sm px-3 py-2 whitespace-pre-line min-w-[200px] max-w-[320px] shadow-lg">
                      <span className="font-bold block mb-1 uppercase tracking-widest text-[10px] text-accent">
                        Reason
                      </span>
                      {row.LackAtdDesc}
                    </span>
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "font-display font-bold text-lg",
                  lowAttendance ? "text-brand" : "text-ink",
                )}
              >
                {row.TotalAtd}
              </div>
            </div>
            <div className="flex items-baseline justify-between py-2 border-b border-ink/5">
              <div className="text-sm text-ink">
                Nilai Akhir
                <span className="text-[11px] text-muted ml-1.5">
                  ({row.TotalScore.toFixed(1)} / {row.MaxScore || "—"})
                </span>
              </div>
              <div className="font-display font-bold text-lg text-ink">
                {finalScore != null ? finalScore.toFixed(1) : row.TotalScore.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between bg-paper-soft rounded-sm p-4 border border-ink/10">
            <div className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              Hasil
            </div>
            <div
              className={cn(
                "font-display text-xl font-bold uppercase tracking-widest",
                result === "Lulus"
                  ? "text-emerald-600"
                  : result === "Tidak Lulus"
                    ? "text-brand"
                    : "text-muted",
              )}
            >
              {result}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted min-w-[120px]">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
