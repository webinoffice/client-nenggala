// src/app/app/(authenticated)/student/_shared/score-import.ts
//
// xlsx helpers for the admin Score Management bulk flow (Step 3d §5).
//
// A SINGLE export doubles as the fillable template AND the current snapshot: one
// row per registered student (from get-student-assess-list), the fixed identity
// columns + one score column per assessment item. A cell is "N/A" where the item
// is above the student's belt level, PRE-FILLED with the saved score for students
// already assessed, or blank for students still awaiting a score. The admin fills
// the blanks and re-imports; save-student-assess-bulk matches each row by
// (UserNoId, UserName, ProgramName, PeriodTitle, BeltName, DojangName) and each
// score by AssessTitle, so those columns must round-trip unchanged. Import is
// fill-only: rows for already-assessed students are skipped by the caller (the
// backend rejects them), so their pre-filled scores are effectively read-only.
import * as XLSX from "xlsx";
import type {
  AssessEntryRow,
  BulkImportRow,
  StudentAssessListRow,
} from "@/lib/api/assessment";

/** Fixed (non-score) leading columns. Score-item columns follow. */
export const FIXED_HEADERS = [
  "No. Reg",
  "Nama Lengkap",
  "Program",
  "Period",
  "Sabuk",
  "Dojang",
  "Total Absen",
  "Alasan Kurang Absen",
] as const;

const FIXED_SET = new Set<string>(FIXED_HEADERS);

/** One registered student plus their saved per-item scores (AssessTempDtId →
 *  AssessScore), empty when not yet assessed. */
export interface ScoreExportStudent {
  meta: StudentAssessListRow;
  scores: Map<number, number>;
}

/** Build the score sheet: one row per student, columns = the given assessment
 *  items (ordered by AssessTempDtId). Cells are "N/A" for items above a student's
 *  belt level, the saved score where present, otherwise blank (to be filled). */
export function buildScoreExport(
  students: ScoreExportStudent[],
  items: AssessEntryRow[],
): (string | number)[][] {
  const sorted = [...items].sort((a, b) => a.AssessTempDtId - b.AssessTempDtId);
  const titles = sorted.map((i) => i.AssessTitle ?? "");

  const header: (string | number)[] = [...FIXED_HEADERS, ...titles];
  const aoa: (string | number)[][] = [header];
  for (const s of students) {
    const m = s.meta;
    const beltLevel = m.BeltLevel ?? 0;
    aoa.push([
      m.UserNoId ?? "",
      m.UserName ?? "",
      m.ProgramName ?? "",
      m.PeriodTitle ?? "", // display only — import forces the canonical value
      m.BeltName ?? "",
      m.DojangName ?? "",
      m.TotalAtd,
      m.LackAtdDesc ?? "",
      ...sorted.map((it) => {
        if ((it.ScoreLevel ?? 0) > beltLevel) return "N/A";
        const v = s.scores.get(it.AssessTempDtId);
        return v == null ? "" : v;
      }),
    ]);
  }
  return aoa;
}

/** Parse a filled template back into bulk-import rows. PeriodTitle is forced to
 *  the period's canonical value (PeriodCount) since the backend matches on it.
 *  Score columns are any header not in FIXED_HEADERS; non-numeric cells ("N/A",
 *  blank) are skipped. */
export async function parseScoreImport(
  file: File,
  periodTitle: string | number,
): Promise<BulkImportRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    blankrows: false,
  });
  if (aoa.length < 2) return [];

  const header = aoa[0].map((h) => String(h ?? "").trim());
  const col = (name: string) => header.indexOf(name);
  const iNoReg = col("No. Reg");
  const iName = col("Nama Lengkap");
  const iProgram = col("Program");
  const iSabuk = col("Sabuk");
  const iDojang = col("Dojang");
  const iLack = col("Alasan Kurang Absen");

  const scoreCols = header
    .map((h, idx) => ({ title: h, idx }))
    .filter((c) => c.title && !FIXED_SET.has(c.title));

  const out: BulkImportRow[] = [];
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r];
    const userNoId = String(row[iNoReg] ?? "").trim();
    if (!userNoId) continue;

    const dataAssess: { AssessTitle: string; AssessScore: number }[] = [];
    for (const c of scoreCols) {
      const cell = row[c.idx];
      if (cell === "" || cell == null) continue;
      const num = Number(cell);
      if (Number.isNaN(num)) continue; // skips "N/A"
      dataAssess.push({ AssessTitle: c.title, AssessScore: num });
    }

    const lack = iLack >= 0 ? String(row[iLack] ?? "").trim() : "";
    out.push({
      UserNoId: userNoId,
      UserName: iName >= 0 ? String(row[iName] ?? "").trim() : "",
      ProgramName: iProgram >= 0 ? String(row[iProgram] ?? "").trim() : "",
      PeriodTitle: periodTitle,
      BeltName: iSabuk >= 0 ? String(row[iSabuk] ?? "").trim() : "",
      DojangName: iDojang >= 0 ? String(row[iDojang] ?? "").trim() : "",
      LackAtdDesc: lack || null,
      DataAssess: dataAssess,
    });
  }
  return out;
}

/** Download an array-of-arrays as a single-sheet .xlsx. */
export function downloadAoa(
  filename: string,
  aoa: (string | number)[][],
  sheetName: string,
): void {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
