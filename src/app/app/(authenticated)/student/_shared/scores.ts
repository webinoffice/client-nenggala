// src/app/app/(authenticated)/student/_shared/scores.ts

import { getSabukRank, getPassingThreshold } from "../../master/_shared/belts";

// Re-exported so existing consumers can keep importing it from scores; the
// implementation now lives with the belt master (audit issue #2).
export { getPassingThreshold } from "../../master/_shared/belts";

export type ScoreKey =
  | "agilityFisik"
  | "pomsaeWajib"
  | "pomsaePilihan"
  | "teknik"
  | "kyukpa"
  | "kyorugi"
  | "basicMovements14"
  | "teori";

export type ScoreCategory = {
  key: ScoreKey;
  label: string;
  conditionLabel?: string;
  minBeltRank?: number;
};

export const SCORE_CATEGORIES: ScoreCategory[] = [
  { key: "agilityFisik", label: "Agility / Fisik" },
  { key: "pomsaeWajib", label: "Pomsae Wajib" },
  { key: "pomsaePilihan", label: "Pomsae Pilihan" },
  { key: "teknik", label: "Teknik" },
  { key: "kyukpa", label: "Kyukpa" },
  {
    key: "kyorugi",
    label: "Kyorugi",
    conditionLabel: "*Sabuk Hijau Keatas",
    minBeltRank: 3,
  },
  {
    key: "basicMovements14",
    label: "14 Basic Movements",
    conditionLabel: "*Sabuk Biru Keatas",
    minBeltRank: 5,
  },
  { key: "teori", label: "Teori" },
];

export const SCORE_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8];

export function isCategoryApplicable(cat: ScoreCategory, sabuk: string) {
  if (cat.minBeltRank === undefined) return true;
  return getSabukRank(sabuk) >= cat.minBeltRank;
}

export type ScoreRecord = {
  studentUsername: string;
  periodId: string;
  sabukAtSubmit: string;             // snapshot of student's belt at submit time
  agilityFisik: number | null;
  pomsaeWajib: number | null;
  pomsaePilihan: number | null;
  teknik: number | null;
  kyukpa: number | null;
  kyorugi: number | null;
  basicMovements14: number | null;
  teori: number | null;
  attendance: number;
  reasonBelowAttendance: string | null;
  total: number;
  result: "Lulus" | "Tidak Lulus";
  submittedBy: string;
  submitDate: string;
};

export function calculateTotal(
  scores: Record<ScoreKey, number | null>,
  sabuk: string,
): number {
  let sum = 0;
  let applicableCount = 0;
  for (const cat of SCORE_CATEGORIES) {
    if (!isCategoryApplicable(cat, sabuk)) continue;
    applicableCount += 1;
    const val = scores[cat.key];
    if (val !== null) sum += val;
  }
  if (applicableCount === 0) return 0;
  // Max possible per applicable category is 8.0
  return (sum / (applicableCount * 8)) * 100;
}

export function determineResult(
  total: number,
  sabuk: string,
): "Lulus" | "Tidak Lulus" {
  return total >= getPassingThreshold(sabuk) ? "Lulus" : "Tidak Lulus";
}

// ---- mock submitted scores ----
// Note: U0006 P30 demonstrates the high-belt fail case under the new rule
// (rank 8 → threshold 85, total 72 < 85). U0006 P29 is configured as a
const INITIAL_SCORES: ScoreRecord[] = [
  {
    studentUsername: "U0006",
    periodId: "30",
    sabukAtSubmit: "Merah Strip Hitam",
    agilityFisik: 8,
    pomsaeWajib: 8,
    pomsaePilihan: 8,
    teknik: 8,
    kyukpa: 8,
    kyorugi: 8,
    basicMovements14: 8,
    teori: 8,
    attendance: 16,
    reasonBelowAttendance: null,
    total: 100,            // 64 / 64 × 100
    result: "Lulus",       // 100 ≥ 85 (high-belt threshold)
    submittedBy: "Carolina",
    submitDate: "2025-07-12T10:00:00Z",
  },
  {
    studentUsername: "U0006",
    periodId: "29",
    sabukAtSubmit: "Biru",
    agilityFisik: 7.5,
    pomsaeWajib: 8,
    pomsaePilihan: 7,
    teknik: 7.5,
    kyukpa: 8,
    kyorugi: 7,
    basicMovements14: 7.5,
    teori: 8,
    attendance: 16,
    reasonBelowAttendance: null,
    total: 94.5,           // 60.5 / 64 × 100 ≈ 94.53
    result: "Lulus",       // 94.5 ≥ 75 (low-belt threshold)
    submittedBy: "Carolina",
    submitDate: "2025-01-15T10:00:00Z",
  },
];

let _scores: ScoreRecord[] = [...INITIAL_SCORES];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}
export function getScores(): ScoreRecord[] {
  return _scores;
}
export function subscribeScores(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function getScoreFor(
  studentUsername: string,
  periodId: string,
): ScoreRecord | null {
  return (
    _scores.find(
      (s) => s.studentUsername === studentUsername && s.periodId === periodId,
    ) ?? null
  );
}
export function submitScoreRecord(rec: ScoreRecord) {
  _scores = [..._scores, rec];
  notify();
}