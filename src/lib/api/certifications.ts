// src/lib/api/certifications.ts
//
// Typed fetchers for the certificate endpoints (backend-nenggala /certif/*).
//
//   get-user-certif-entry  the recipient picker — active students (S) +
//                          instructors (I), with the UserDataId needed to save.
//   get-certif             certificates, scoped server-side by the caller:
//                          a student/instructor sees only their own; a dojang
//                          admin sees their dojang; super-admin sees all.
//   save-certif            multipart insert/update (file field "CertifImage").
//   delete-certif          remove one certificate (also unlinks its file).
//
// All calls attach the bearer token. MsgData is the row array.
import { apiPost, apiPostForm } from "./client";

const NO_SEARCH = { FieldName: "", FieldValue: "" };

// ---- recipient picker ----

export interface UserCertifEntryRow {
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  UserTypeCode: string; // "S" student, "I" instructor/coach
  UserTypeName: string | null;
}

export function fetchUserCertifEntry(): Promise<UserCertifEntryRow[]> {
  return apiPost<UserCertifEntryRow[]>(
    "/certif/get-user-certif-entry",
    { objParam: { ObjSearch: NO_SEARCH } },
    { auth: true },
  );
}

// ---- certificates ----

export interface CertifRow {
  CertifId: number;
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  UserTypeCode: string | null; // "S" student, "I" coach
  CertifTitle: string | null;
  CertifDesc: string | null;
  CertifImage: string | null; // relative path (resolve with fileUrl)
  CertifDate: string | null; // "dd/mm/yyyy"
  DojangId: number | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-certif — scoped by the caller server-side. Optional UserName narrows it. */
export function fetchCertif(userName?: string): Promise<CertifRow[]> {
  return apiPost<CertifRow[]>(
    "/certif/get-certif",
    { objParam: { ObjSearch: NO_SEARCH, UserName: userName ?? "" } },
    { auth: true },
  );
}

// ---- writes ----

export interface CertifSaveParams {
  CertifId: number; // 0 when inserting
  UserDataId: number;
  CertifTitle: string;
  CertifDesc: string;
  CertifDate: string; // "YYYY-MM-DD"
  FgMode: "I" | "E";
}

/** save-certif — multipart insert/update. The image rides as field "CertifImage"
 *  (objParam is a JSON string, the standard multipart convention). */
export function saveCertif(
  params: CertifSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("CertifImage", file);
  return apiPostForm<void>("/certif/save-certif", form, { auth: true });
}

export function deleteCertif(certifId: number): Promise<void> {
  return apiPost<void>(
    "/certif/delete-certif",
    { objParam: { CertifId: certifId } },
    { auth: true },
  );
}

/** "dd/mm/yyyy" (backend) → "d Month yyyy" (id-ID). Falls back to the raw value. */
export function formatCertDate(value: string | null | undefined): string {
  if (!value) return "";
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return value;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
