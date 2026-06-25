// src/lib/api/dates.ts
//
// The backend formats dates as strings in two shapes:
//   "dd/mm/yyyy"            — UserBirthDate, UserJoinDate
//   "dd/mm/yyyy HH:mm:ss"   — UpdateDate
// Neither is parseable by `new Date(...)`, so stores normalise them to ISO on
// hydration. This keeps every consumer (date inputs, `new Date(updateDate)`
// formatters) working and gives a single, consistent timestamp format (#5).

/** "dd/mm/yyyy" → "yyyy-mm-dd" (empty string if unparseable). */
export function dmyToIso(value: string | null | undefined): string {
  if (!value) return "";
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

/** "dd/mm/yyyy HH:mm:ss" (time optional) → "yyyy-mm-ddTHH:mm:ss". */
export function dmyhmsToIso(value: string | null | undefined): string {
  if (!value) return "";
  const m = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!m) return "";
  const [, d, mo, y, hh = "00", mm = "00", ss = "00"] = m;
  return `${y}-${mo}-${d}T${hh}:${mm}:${ss}`;
}
