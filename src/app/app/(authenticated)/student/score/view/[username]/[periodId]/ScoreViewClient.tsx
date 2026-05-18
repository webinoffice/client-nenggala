// src/app/app/(authenticated)/student/score/view/[username]/[periodId]/ScoreViewClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/app/PageHeader";
import { formatPeriod, getPeriodById } from "../../../../_shared/academic";
import { getStudentByUsername } from "../../../../_shared/students";
import { MIN_ATTENDANCE } from "../../../../_shared/attendance";
import {
  getScoreFor,
  isCategoryApplicable,
  SCORE_CATEGORIES,
} from "../../../../_shared/scores";

interface Props {
  username: string;
  periodId: string;
}

export default function ScoreViewClient({ username, periodId }: Props) {
  const router = useRouter();
  const [student] = useState(() => getStudentByUsername(username));
  const [record] = useState(() => getScoreFor(username, periodId));
  const period = getPeriodById(periodId);

  if (!student || !record) {
    return (
      <>
        <PageHeader title="Score Not Found" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
          <p className="text-muted text-sm">
            No score submitted for {username} (Period {periodId}).
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  const lowAttendance = record.attendance < MIN_ATTENDANCE;

  // Split categories into two visual columns (figma layout)
  const half = Math.ceil(SCORE_CATEGORIES.length / 2);
  const leftCol = SCORE_CATEGORIES.slice(0, half);
  const rightCol = SCORE_CATEGORIES.slice(half);

  const renderCategoryRow = (cat: (typeof SCORE_CATEGORIES)[number]) => {
    const applicable = isCategoryApplicable(cat, student.sabuk);
    const value = record[cat.key];
    return (
      <div
        key={cat.key}
        className="flex items-baseline justify-between py-2 border-b border-ink/5"
      >
        <div>
          <div className="text-sm text-ink">{cat.label}</div>
          {cat.conditionLabel && (
            <div className="text-[10px] text-muted uppercase tracking-widest">
              {cat.conditionLabel}
            </div>
          )}
        </div>
        <div className="font-display font-bold text-lg text-ink">
          {applicable && value !== null ? value.toFixed(1) : "—"}
        </div>
      </div>
    );
  };

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
            <InfoRow label="No" value={student.username} />
            <InfoRow
              label="Periode"
              value={period ? formatPeriod(period) : periodId}
            />
            <InfoRow label="Nama Lengkap" value={student.namaLengkap} />
            <InfoRow label="Dojang" value={student.dojang} />
            <InfoRow label="Sabuk" value={record.sabukAtSubmit} />{" "}
            <InfoRow
              label="Submitted By"
              value={`${record.submittedBy} · ${new Date(record.submitDate).toLocaleString()}`}
            />
          </div>
        </section>

        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            Subyek Penilaian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>{leftCol.map(renderCategoryRow)}</div>
            <div>{rightCol.map(renderCategoryRow)}</div>
          </div>

          {/* Absen + Total + Hasil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-2">
            <div className="flex items-baseline justify-between py-2 border-b border-ink/5">
              <div className="text-sm text-ink flex items-center gap-1.5">
                Absen
                {lowAttendance && record.reasonBelowAttendance && (
                  <span
                    className="relative inline-flex group cursor-help"
                    title={record.reasonBelowAttendance}
                  >
                    <Info size={14} className="text-brand" />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 hidden group-hover:block z-10 bg-ink text-paper text-xs rounded-sm px-3 py-2 whitespace-pre-line min-w-[200px] max-w-[320px] shadow-lg">
                      <span className="font-bold block mb-1 uppercase tracking-widest text-[10px] text-accent">
                        Reason
                      </span>
                      {record.reasonBelowAttendance}
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
                {record.attendance}
              </div>
            </div>
            <div className="flex items-baseline justify-between py-2 border-b border-ink/5">
              <div className="text-sm text-ink">Total</div>
              <div className="font-display font-bold text-lg text-ink">
                {record.total.toFixed(1)}
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
                record.result === "Lulus" ? "text-emerald-600" : "text-brand",
              )}
            >
              {record.result}
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
