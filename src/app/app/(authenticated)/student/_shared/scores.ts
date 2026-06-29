// src/app/app/(authenticated)/student/_shared/scores.ts
//
// Score (assessment) data layer — Step 3d re-model. The old fixed-8-category,
// client-computed-percentage, JS-pass-threshold model is gone; this matches the
// backend's template-driven model:
//
//   - the exam/score table per period   → get-student-assess-list
//     (only students REGISTERED for exam, with TotalAtd / TotalScore / payment)
//   - the assessment items to score      → get-assess-entry (by belt level)
//   - a student's saved scores           → get-assess-result
//   - save one student                   → save-student-assess-single
//     (inserts one row per item; the backend auto-promotes the belt when the
//      total reaches BeltMaster.BeltPassScore — there is no dedupe, so callers
//      must not re-submit an already-assessed student)
//
// Pass/fail is NOT stored. Derive it from TotalScore vs the belt's BeltPassScore
// (belts store). All three caches share one version counter for re-render.
import {
  fetchStudentAssessList,
  fetchAssessEntry,
  fetchAssessResult,
  saveStudentAssessSingle,
  type StudentAssessListRow,
  type AssessEntryRow,
  type AssessResultRow,
} from "@/lib/api/assessment";
import { ensureBeltsLoaded, getBeltPassScore } from "../../master/_shared/belts";

export type ExamScoreRow = StudentAssessListRow;
export type AssessItem = AssessEntryRow;
export type AssessResult = AssessResultRow;

// ---- shared notify (one version drives all score-derived views) ----
let _version = 0;
const listeners = new Set<() => void>();
function notify() {
  _version += 1;
  listeners.forEach((l) => l());
}
export function subscribeScores(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function getScoresVersion() {
  return _version;
}

// ---- exam / score list (per period) ----
const EMPTY_LIST: StudentAssessListRow[] = [];
const _listByPeriod = new Map<number, StudentAssessListRow[]>();
const _listLoaded = new Set<number>();
const _listLoading = new Map<number, Promise<void>>();

export function getAssessList(periodId: number): StudentAssessListRow[] {
  return _listByPeriod.get(periodId) ?? EMPTY_LIST;
}

export function getAssessRow(
  periodId: number,
  studentId: number,
  programMsId: number,
): StudentAssessListRow | null {
  return (
    getAssessList(periodId).find(
      (r) => r.UserDataId === studentId && r.ProgramMsId === programMsId,
    ) ?? null
  );
}

async function loadList(periodId: number): Promise<void> {
  // Belts back the pass-score derivation used by every score view.
  await ensureBeltsLoaded();
  const rows = (await fetchStudentAssessList({ schPeriodId: periodId })) ?? [];
  _listByPeriod.set(periodId, rows);
}

export function ensureAssessListLoaded(periodId: number): Promise<void> {
  if (!periodId) return Promise.resolve();
  if (_listLoaded.has(periodId)) return Promise.resolve();
  let p = _listLoading.get(periodId);
  if (!p) {
    p = loadList(periodId)
      .then(() => {
        _listLoaded.add(periodId);
        _listLoading.delete(periodId);
        notify();
      })
      .catch((err) => {
        console.error("Failed to load assess list", err);
        _listLoading.delete(periodId);
      });
    _listLoading.set(periodId, p);
  }
  return p;
}

export async function reloadAssessList(periodId: number): Promise<void> {
  _listLoaded.delete(periodId);
  _listLoading.delete(periodId);
  await ensureAssessListLoaded(periodId);
}

// ---- assessment template items (per belt level; level 0 is valid) ----
const EMPTY_ITEMS: AssessEntryRow[] = [];
const _itemsByLevel = new Map<number, AssessEntryRow[]>();
const _itemsLoaded = new Set<number>();
const _itemsLoading = new Map<number, Promise<void>>();

export function getAssessItems(beltLevel: number): AssessEntryRow[] {
  return _itemsByLevel.get(beltLevel) ?? EMPTY_ITEMS;
}

export function ensureAssessItemsLoaded(beltLevel: number): Promise<void> {
  if (beltLevel < 0) return Promise.resolve();
  if (_itemsLoaded.has(beltLevel)) return Promise.resolve();
  let p = _itemsLoading.get(beltLevel);
  if (!p) {
    p = fetchAssessEntry(beltLevel)
      .then((rows) => {
        _itemsByLevel.set(beltLevel, rows ?? []);
        _itemsLoaded.add(beltLevel);
        _itemsLoading.delete(beltLevel);
        notify();
      })
      .catch((err) => {
        console.error("Failed to load assess items", err);
        _itemsLoading.delete(beltLevel);
      });
    _itemsLoading.set(beltLevel, p);
  }
  return p;
}

// ---- a student's saved scores (per student/program/period) ----
const EMPTY_RESULT: AssessResultRow[] = [];
const _resultByKey = new Map<string, AssessResultRow[]>();
const _resultLoaded = new Set<string>();
const _resultLoading = new Map<string, Promise<void>>();

function rKey(studentId: number, programMsId: number, periodId: number): string {
  return `${studentId}|${programMsId}|${periodId}`;
}

export function getAssessResultFor(
  studentId: number,
  programMsId: number,
  periodId: number,
): AssessResultRow[] {
  return _resultByKey.get(rKey(studentId, programMsId, periodId)) ?? EMPTY_RESULT;
}

export function ensureAssessResultLoaded(
  studentId: number,
  programMsId: number,
  periodId: number,
): Promise<void> {
  if (!studentId || !programMsId || !periodId) return Promise.resolve();
  const key = rKey(studentId, programMsId, periodId);
  if (_resultLoaded.has(key)) return Promise.resolve();
  let p = _resultLoading.get(key);
  if (!p) {
    p = fetchAssessResult({ studentId, programMsId, schPeriodId: periodId })
      .then((rows) => {
        _resultByKey.set(key, rows ?? []);
        _resultLoaded.add(key);
        _resultLoading.delete(key);
        notify();
      })
      .catch((err) => {
        console.error("Failed to load assess result", err);
        _resultLoading.delete(key);
      });
    _resultLoading.set(key, p);
  }
  return p;
}

export async function reloadAssessResult(
  studentId: number,
  programMsId: number,
  periodId: number,
): Promise<void> {
  const key = rKey(studentId, programMsId, periodId);
  _resultLoaded.delete(key);
  _resultLoading.delete(key);
  await ensureAssessResultLoaded(studentId, programMsId, periodId);
}

// ---- save one student's scores ----
export interface SaveScoreInput {
  studentId: number;
  programMsId: number;
  schPeriodId: number;
  beltMasterId: number;
  /** Required only when attendance is below the minimum (records StudentLack). */
  lackAtdDesc?: string | null;
  dataAssess: { assessTempDtId: number; assessScore: number }[];
}

/** Persist a student's assessment, then refresh the period list + that result. */
export async function saveScore(input: SaveScoreInput): Promise<void> {
  await saveStudentAssessSingle({
    StudentId: input.studentId,
    ProgramMsId: input.programMsId,
    SchPeriodId: input.schPeriodId,
    BeltMasterId: input.beltMasterId,
    LackAtdDesc: input.lackAtdDesc ?? null,
    DataAssess: input.dataAssess.map((d) => ({
      AssessTempDtId: d.assessTempDtId,
      AssessScore: d.assessScore,
    })),
  });
  await Promise.all([
    reloadAssessList(input.schPeriodId),
    reloadAssessResult(input.studentId, input.programMsId, input.schPeriodId),
  ]);
}

// ---- derived helpers ----

/** Valid score choices for an item: MinScore..MaxScore in 0.5 steps (AssessScore
 *  is a double in the DB). */
export function scoreOptions(
  min: number | null,
  max: number | null,
): number[] {
  const lo = min ?? 0;
  const hi = max ?? 0;
  if (hi < lo) return [];
  const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += 0.5) out.push(Math.round(v * 10) / 10);
  return out;
}

/** True once a registered student has scores (TotalScore is a sum of 5–8s). */
export function isAssessed(totalScore: number): boolean {
  return totalScore > 0;
}

/** Lulus when the total reaches the belt's pass score. null when unknown
 *  (belts not loaded / belt without a pass score). */
export function isLulus(
  totalScore: number,
  beltMasterId: number | null,
): boolean | null {
  const pass = getBeltPassScore(beltMasterId);
  if (pass == null) return null;
  return totalScore >= pass;
}

export function resultLabel(
  totalScore: number,
  beltMasterId: number | null,
): "Lulus" | "Tidak Lulus" | "—" {
  const v = isLulus(totalScore, beltMasterId);
  return v == null ? "—" : v ? "Lulus" : "Tidak Lulus";
}
