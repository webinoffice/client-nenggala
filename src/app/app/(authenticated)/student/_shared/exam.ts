// src/app/app/(authenticated)/student/_shared/exam.ts
//
// Self-scoped exam-registration ("Ikut Ujian") state for the logged-in student.
// Step 3d flow A: the student registers for their period's exam and uploads a
// payment proof (bukti bayar), after which they appear in the admin score table.
//
// Exam registration is keyed on (SchPeriodId, StudentId, ProgramMsId) where the
// program is the student's MAIN program (FgMain='Y') — NOT the per-class program
// on the schedule. So the eligible program + numeric StudentId are resolved from
// the backend, not from the schedule store:
//
//   get-student-to-exam     eligible-but-not-yet-registered (main program rows)
//   get-student-assess-list already-registered (with payment proof + total)
//
// Both endpoints return every student in the period; we filter to the caller's
// own UserDataId. (The backend does not self-scope these reads — flagged; a
// per-student read would be the proper fix.) Cached per period.
import {
  fetchStudentToExam,
  fetchStudentAssessList,
  saveExamByStudent,
} from "@/lib/api/assessment";

export type ExamEligibility = {
  studentId: number; // UserData.UserDataId
  programMsId: number; // MAIN ProgramMsId
  programName: string;
  beltMasterId: number | null;
  beltName: string;
  periodTitle: string;
};

export type ExamRegistration = {
  studentId: number;
  programMsId: number;
  programName: string;
  beltMasterId: number | null;
  beltName: string;
  /** Relative path to the uploaded payment proof (null for admin cash regs). */
  examPaymentFile: string | null;
  totalScore: number;
  /** True once the student has been assessed (score entered by admin). */
  assessed: boolean;
};

type PeriodExam = {
  eligibility: ExamEligibility[];
  registrations: ExamRegistration[];
};

const EMPTY: PeriodExam = { eligibility: [], registrations: [] };

// ---- per-period cache ----
const _byPeriod = new Map<number, PeriodExam>();
let _version = 0;
const listeners = new Set<() => void>();
function notify() {
  _version += 1;
  listeners.forEach((l) => l());
}

export function subscribeExam(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
/** Version snapshot for useSyncExternalStore (bumps when a period (re)loads). */
export function getExamVersion() {
  return _version;
}

export function getExamEligibility(periodId: number): ExamEligibility[] {
  return (_byPeriod.get(periodId) ?? EMPTY).eligibility;
}
export function getExamRegistrations(periodId: number): ExamRegistration[] {
  return (_byPeriod.get(periodId) ?? EMPTY).registrations;
}

// ---- loading ----
const _loaded = new Set<number>();
const _loading = new Map<number, Promise<void>>();

async function loadPeriod(periodId: number, userDataId: number): Promise<void> {
  const [toExam, assessList] = await Promise.all([
    fetchStudentToExam(periodId).catch(() => []),
    fetchStudentAssessList({ schPeriodId: periodId }).catch(() => []),
  ]);

  const eligibility: ExamEligibility[] = (toExam ?? [])
    .filter((r) => r.StudentId === userDataId)
    .map((r) => ({
      studentId: r.StudentId,
      programMsId: r.ProgramMsId,
      programName: r.ProgramName ?? "",
      beltMasterId: r.BeltMasterId,
      beltName: r.BeltName ?? "-",
      periodTitle: r.PeriodTitle ?? "",
    }));

  const registrations: ExamRegistration[] = (assessList ?? [])
    .filter((r) => r.UserDataId === userDataId)
    .map((r) => ({
      studentId: r.UserDataId,
      programMsId: r.ProgramMsId,
      programName: r.ProgramName ?? "",
      beltMasterId: r.BeltMasterId,
      beltName: r.BeltName ?? "-",
      examPaymentFile: r.ExamPaymentFile,
      totalScore: r.TotalScore,
      assessed: r.TotalScore > 0,
    }));

  _byPeriod.set(periodId, { eligibility, registrations });
}

/** One-time (per period) hydration of the student's exam status. */
export function ensureExamLoaded(
  periodId: number,
  userDataId: number,
): Promise<void> {
  if (!periodId || !userDataId) return Promise.resolve();
  if (_loaded.has(periodId)) return Promise.resolve();
  let p = _loading.get(periodId);
  if (!p) {
    p = loadPeriod(periodId, userDataId)
      .then(() => {
        _loaded.add(periodId);
        _loading.delete(periodId);
        notify();
      })
      .catch((err) => {
        console.error("Failed to load exam status", err);
        _loading.delete(periodId);
      });
    _loading.set(periodId, p);
  }
  return p;
}

/** Re-fetch a period after a write. */
export async function reloadExam(
  periodId: number,
  userDataId: number,
): Promise<void> {
  _loaded.delete(periodId);
  _loading.delete(periodId);
  await ensureExamLoaded(periodId, userDataId);
}

// ---- write (flow A) ----

/** Register the student for the period's exam with a payment proof, then refresh
 *  the period so the eligibility flips to a registration. Throws ApiError on
 *  failure (e.g. already registered). */
export async function registerExam(
  input: { schPeriodId: number; studentId: number; programMsId: number },
  file: File,
): Promise<void> {
  await saveExamByStudent(
    {
      SchPeriodId: input.schPeriodId,
      StudentId: input.studentId,
      ProgramMsId: input.programMsId,
    },
    file,
  );
  await reloadExam(input.schPeriodId, input.studentId);
}
