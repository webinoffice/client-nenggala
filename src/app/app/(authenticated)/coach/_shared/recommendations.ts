// src/app/app/(authenticated)/coach/_shared/recommendations.ts

export type Recommendation = {
  id: string;
  studentUsername: string;
  scheduleId: string; // which schedule this came from
  dojang: string; // snapshot
  sabuk: string; // snapshot
  category: string; // typically the schedule's sub-program name
  coachUsername: string;
  periodId: string;
  recommendationDate: string; // YYYY-MM-DD
  note?: string;
};

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "REC-0001",
    scheduleId: "SCH-0001",
    studentUsername: "U0006",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah Strip Hitam",
    category: "Pomsae",
    coachUsername: "C0001",
    periodId: "32",
    recommendationDate: "2026-02-12",
  },
  {
    id: "REC-0002",
    scheduleId: "SCH-0004",
    studentUsername: "U0006",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah Strip Hitam",
    category: "Kyorugi",
    coachUsername: "C0004",
    periodId: "32",
    recommendationDate: "2026-02-15",
  },
  {
    id: "REC-0003",
    scheduleId: "SCH-0006",
    studentUsername: "U0006",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah Strip Hitam",
    category: "Pomsae",
    coachUsername: "C0005",
    periodId: "32",
    recommendationDate: "2026-03-02",
  },
  {
    id: "REC-0004",
    scheduleId: "SCH-0005",
    studentUsername: "U0007",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah",
    category: "Pomsae",
    coachUsername: "C0001",
    periodId: "32",
    recommendationDate: "2026-03-10",
  },
  {
    id: "REC-0005",
    scheduleId: "SCH-0004",
    studentUsername: "U0005",
    dojang: "Kedoya Sport Club",
    sabuk: "Biru",
    category: "Kyorugi",
    coachUsername: "C0004",
    periodId: "32",
    recommendationDate: "2026-03-18",
  },
];

let _recs: Recommendation[] = [...INITIAL_RECOMMENDATIONS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getRecommendations() {
  return _recs;
}
export function subscribeRecommendations(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function findRecommendation(
  studentUsername: string,
  scheduleId: string,
): Recommendation | null {
  return (
    _recs.find(
      (r) =>
        r.studentUsername === studentUsername && r.scheduleId === scheduleId,
    ) ?? null
  );
}
export function getNextRecommendationId(): string {
  const max = _recs.reduce((m, r) => {
    const n = parseInt(r.id.replace(/^REC-/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `REC-${String(max + 1).padStart(4, "0")}`;
}
export function addRecommendation(rec: Recommendation) {
  _recs = [..._recs, rec];
  notify();
}
export function removeRecommendation(id: string) {
  _recs = _recs.filter((r) => r.id !== id);
  notify();
}
