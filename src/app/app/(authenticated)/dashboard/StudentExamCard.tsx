// src/app/app/(authenticated)/dashboard/StudentExamCard.tsx
//
// Dashboard "Ikut Ujian" entry (Step 3d flow A). Resolves the student's current
// period from their enrolled classes, then shows the exam-registration action for
// that period: a button per eligible main program, or a "registered" badge once
// they have signed up. Self-contained so the dashboard stays lean.
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/session";
import {
  getSchedules,
  subscribeSchedules,
  getCurrentPeriod,
} from "../coach/_shared/schedules";
import {
  ensureExamLoaded,
  getExamEligibility,
  getExamRegistrations,
  getExamVersion,
  subscribeExam,
  type ExamEligibility,
} from "../student/_shared/exam";
import ExamRegistrationModal from "../me/schedule/ExamRegistrationModal";

export default function StudentExamCard() {
  const session = useSession();
  const username = session?.noReg ?? "";
  const userDataId = session?.userDataId ?? 0;

  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  useSyncExternalStore(subscribeExam, getExamVersion, getExamVersion);

  const enrolled = useMemo(
    () => schedules.filter((s) => s.studentUsernames.includes(username)),
    [schedules, username],
  );
  const currentPeriod = useMemo(() => getCurrentPeriod(enrolled), [enrolled]);
  const periodId = currentPeriod?.id ?? 0;

  useEffect(() => {
    if (periodId !== 0 && userDataId !== 0) {
      ensureExamLoaded(periodId, userDataId);
    }
  }, [periodId, userDataId]);

  const eligibility = getExamEligibility(periodId);
  const registrations = getExamRegistrations(periodId);
  const [registering, setRegistering] = useState<ExamEligibility | null>(null);

  // Nothing exam-related this period → don't render the card at all.
  if (periodId === 0 || (eligibility.length === 0 && registrations.length === 0)) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} className="text-ink" />
        <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
          Ikut Ujian
        </h2>
      </div>

      <div className="bg-paper rounded-sm border border-ink/10 p-5 space-y-3">
        <p className="text-xs text-muted">
          {currentPeriod?.title ?? "—"}
        </p>

        {eligibility.map((e) => (
          <div
            key={e.programMsId}
            className="flex items-center justify-between gap-4 border-b border-ink/5 pb-3 last:border-b-0 last:pb-0"
          >
            <div>
              <div className="font-display font-bold uppercase tracking-wide text-sm text-ink">
                {e.programName}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {e.beltName}
              </div>
            </div>
            <button
              onClick={() => setRegistering(e)}
              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
            >
              <Award size={12} />
              Ikut Ujian
            </button>
          </div>
        ))}

        {registrations.map((r) => (
          <div
            key={r.programMsId}
            className="flex items-center justify-between gap-4 border-b border-ink/5 pb-3 last:border-b-0 last:pb-0"
          >
            <div>
              <div className="font-display font-bold uppercase tracking-wide text-sm text-ink">
                {r.programName}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {r.assessed ? "Score available" : "Awaiting assessment"}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              <CheckCircle2 size={12} />
              Terdaftar
            </span>
          </div>
        ))}
      </div>

      <ExamRegistrationModal
        eligibility={registering}
        schPeriodId={periodId}
        onClose={() => setRegistering(null)}
      />
    </section>
  );
}
