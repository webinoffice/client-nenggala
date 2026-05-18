// src/app/app/(authenticated)/student/_shared/scores.ts

import { SABUK_RANK } from "./students";

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

// Display order matters — the view page uses this for the two-column layout.
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
export const PASSING_TOTAL = 60;

export function isCategoryApplicable(cat: ScoreCategory, sabuk: string) {
  if (cat.minBeltRank === undefined) return true;
  return (SABUK_RANK[sabuk] ?? 0) >= cat.minBeltRank;
}

export type ScoreRecord = {
  studentUsername: string;
  periodId: string;
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
  attendance: number,
): number {
  const subjects = (Object.values(scores) as (number | null)[])
    .filter((v): v is number => v !== null)
    .reduce((a, b) => a + b, 0);
  return subjects + attendance / 2;
}

export function determineResult(total: number): "Lulus" | "Tidak Lulus" {
  return total >= PASSING_TOTAL ? "Lulus" : "Tidak Lulus";
}

// ---- mock submitted scores ----
const INITIAL_SCORES: ScoreRecord[] = [
  {
    studentUsername: "U0006",
    periodId: "30",
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
    total: 72,
    result: "Lulus",
    submittedBy: "Carolina",
    submitDate: "2025-07-12T10:00:00Z",
  },
  {
    studentUsername: "U0006",
    periodId: "29",
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
    total: 68.5,
    result: "Lulus",
    submittedBy: "Carolina",
    submitDate: "2025-01-15T10:00:00Z",
  },
];

// store
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