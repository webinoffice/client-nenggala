// src/lib/api/schedule-merge.ts
//
// Typed wrappers for the "Latihan Gabungan" (joint-training) endpoints
// (backend-nenggala /schedule/*-merge-*). A merge schedule is a standalone
// event (title/date/time/image/description) not tied to a program or period.
//
//   get-schedule-merge-hd               list all events (or one by id)
//   get-schedule-merge-hd-display       the single featured event (dashboard
//                                       highlight; falls back to a date-priority
//                                       pick when none is flagged featured)
//   get-schedule-merge-participant-to-atd  active students+coaches NOT yet present
//   get-schedule-merge-atd-display      who is already marked present
//   save-schedule-merge-hd              multipart insert/update (file "ScheduleImage")
//   save-schedule-merge-atd             bulk-insert attendance
//   delete-schedule-merge-hd            delete an event (rejected while attendance exists)
//   delete-schedule-merge-atd           bulk-remove attendance
//
// All calls attach the bearer token. MsgData is the row array (or one object).
import { apiPost, apiPostForm } from "./client";

// ---- header (event) ----

export interface ScheduleMergeHdRow {
  ScheduleMergeHdId: number;
  ScheduleTitle: string | null;
  /** "YYYY-MM-DD" — for form prefill / sorting. */
  ScheduleDateIso: string | null;
  /** "Weekday, dd Mon yyyy" — for display. */
  ScheduleDateStr: string | null;
  /** "HH:mm" */
  TimeStart: string | null;
  TimeEnd: string | null;
  ScheduleDesc: string | null;
  ScheduleImage: string | null; // relative path (resolve with fileUrl)
  FgFeatured: string | null; // "Y" / "N"
  UpdatedBy: string | null;
  UpdateDate: string | null;
}

/** get-schedule-merge-hd — all events (ScheduleMergeHdId 0 = no filter; the
 *  backend rejects an empty objParam, so 0 is always sent). */
export function fetchScheduleMergeHds(): Promise<ScheduleMergeHdRow[]> {
  return apiPost<ScheduleMergeHdRow[]>(
    "/schedule/get-schedule-merge-hd",
    { objParam: { ScheduleMergeHdId: 0 } },
    { auth: true },
  );
}

/** get-schedule-merge-hd-display — the single featured highlight (or {} when
 *  there are no events at all). */
export function fetchScheduleMergeFeatured(): Promise<ScheduleMergeHdRow | null> {
  return apiPost<ScheduleMergeHdRow | null>(
    "/schedule/get-schedule-merge-hd-display",
    { objParam: { Display: 1 } },
    { auth: true },
  );
}

// ---- participants / attendance ----

export interface MergeParticipantRow {
  ScheduleMergeAtdId?: number; // present only on the atd-display variant
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  DojangName: string | null;
  UserTypeName: string | null;
}

/** get-schedule-merge-participant-to-atd — active students+coaches not yet
 *  marked present for this event (the attendance pick-list). */
export function fetchMergeParticipantsToAtd(
  scheduleMergeHdId: number,
): Promise<MergeParticipantRow[]> {
  return apiPost<MergeParticipantRow[]>(
    "/schedule/get-schedule-merge-participant-to-atd",
    { objParam: { ScheduleMergeHdId: scheduleMergeHdId } },
    { auth: true },
  );
}

/** get-schedule-merge-atd-display — attendees already marked present (each row
 *  carries its ScheduleMergeAtdId so it can be removed). */
export function fetchMergeAtdDisplay(
  scheduleMergeHdId: number,
): Promise<MergeParticipantRow[]> {
  return apiPost<MergeParticipantRow[]>(
    "/schedule/get-schedule-merge-atd-display",
    { objParam: { ScheduleMergeHdId: scheduleMergeHdId } },
    { auth: true },
  );
}

// ---- writes ----

export interface MergeHdSaveParams {
  ScheduleMergeHdId: number; // 0 when inserting
  ScheduleTitle: string;
  ScheduleDate: string; // "YYYY-MM-DD"
  TimeStart: string; // "HH:mm"
  TimeEnd: string; // "HH:mm"
  ScheduleDesc: string;
  FgFeatured: "Y" | "N";
  FgMode: "I" | "E";
}

/** save-schedule-merge-hd — multipart insert/update. The image rides as field
 *  "ScheduleImage"; on edit with no new file the backend keeps the existing one.
 *  Flagging FgFeatured "Y" clears the flag on every other event (single highlight). */
export function saveScheduleMergeHd(
  params: MergeHdSaveParams,
  image: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (image) form.append("ScheduleImage", image);
  return apiPostForm<void>("/schedule/save-schedule-merge-hd", form, {
    auth: true,
  });
}

/** save-schedule-merge-atd — mark a set of users present (bulk insert). */
export function saveScheduleMergeAtd(
  scheduleMergeHdId: number,
  userDataIds: number[],
): Promise<void> {
  return apiPost<void>(
    "/schedule/save-schedule-merge-atd",
    {
      objParam: {
        ScheduleMergeHdId: scheduleMergeHdId,
        DataMergeAtd: userDataIds.map((UserDataId) => ({ UserDataId })),
      },
    },
    { auth: true },
  );
}

/** delete-schedule-merge-hd — remove an event. Rejected by the backend while it
 *  still has attendance rows (delete those first). Throws the server's error. */
export function deleteScheduleMergeHd(scheduleMergeHdId: number): Promise<void> {
  return apiPost<void>(
    "/schedule/delete-schedule-merge-hd",
    { objParam: { ScheduleMergeHdId: scheduleMergeHdId } },
    { auth: true },
  );
}

/** delete-schedule-merge-atd — remove a set of attendance rows (bulk). */
export function deleteScheduleMergeAtd(
  scheduleMergeAtdIds: number[],
): Promise<void> {
  return apiPost<void>(
    "/schedule/delete-schedule-merge-atd",
    {
      objParam: {
        DataMergeAtd: scheduleMergeAtdIds.map((ScheduleMergeAtdId) => ({
          ScheduleMergeAtdId,
        })),
      },
    },
    { auth: true },
  );
}
