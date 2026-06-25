// src/lib/api/master.ts
//
// Typed fetchers for the authenticated master endpoints (backend-nenggala
// /master/*). Every list endpoint replies with MsgData = the row array; rows
// carry the table's numeric PK, an FgStatus ("Y"/"N") and a pre-formatted
// UpdateDate string ("dd/mm/yyyy HH:mm:ss"). These read the FULL list
// (FgStatus "" = both active + inactive) so the master CRUD screens can show
// and toggle inactive rows.
//
// NOTE (Step 3c): reads only for now. The matching save/inact/delete writes are
// multipart and depend on the backend objParam-parse + Uploads static-serving
// prerequisites; they're wired in a later pass.
import { apiPost } from "./client";

/** ObjSearch default — the backend skips filtering when FieldName/Value are blank. */
const NO_SEARCH = { FieldName: "", FieldValue: "" };

export interface ProgramMsRow {
  ProgramMsId: number;
  ProgramName: string;
  ProgramMsImage: string | null;
  FgStatus: string;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchPrograms(): Promise<ProgramMsRow[]> {
  return apiPost<ProgramMsRow[]>(
    "/master/get-programms",
    { objParam: { ObjSearch: NO_SEARCH, FgStatus: "", ProgramMsId: null } },
    { auth: true },
  );
}

export interface ProgramDtRow {
  ProgramMsId: number;
  ProgramName: string;
  ProgramDtId: number;
  ProgramDtName: string;
  ProgramDtImage: string | null;
  FgStatus: string;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchSubPrograms(): Promise<ProgramDtRow[]> {
  return apiPost<ProgramDtRow[]>(
    "/master/get-programdt",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        FgStatus: "",
        ProgramMsId: null,
        ProgramDtId: null,
      },
    },
    { auth: true },
  );
}

export interface BeltMasterRow {
  BeltMasterId: number;
  BeltName: string;
  BeltLevel: number;
  BeltSeq: number | null;
  /** Server-authoritative passing threshold (relevant to audit issue #6). */
  BeltPassScore: number | null;
  FgStatus: string;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchBeltMaster(): Promise<BeltMasterRow[]> {
  return apiPost<BeltMasterRow[]>(
    "/master/get-beltmaster",
    { objParam: { ObjSearch: NO_SEARCH, FgStatus: "", ProgramMsId: null } },
    { auth: true },
  );
}

export interface DojangRow {
  DojangId: number;
  DojangName: string;
  DojangImage: string | null;
  FgStatus: string;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchDojangs(): Promise<DojangRow[]> {
  return apiPost<DojangRow[]>(
    "/master/get-dojang",
    { objParam: { ObjSearch: NO_SEARCH, FgStatus: "" } },
    { auth: true },
  );
}

export interface ProductRow {
  ProductId: number;
  ProductTypeId: number;
  ProductTypeName: string;
  ProductName: string;
  ProductLink: string | null;
  ProductImage: string | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchProducts(): Promise<ProductRow[]> {
  return apiPost<ProductRow[]>(
    "/master/get-product",
    { objParam: { ObjSearch: NO_SEARCH, ProductTypeId: "", ProductId: "" } },
    { auth: true },
  );
}

export interface SchPeriodRow {
  SchPeriodId: number;
  PeriodTitle: string;
  /** Backend-formatted "dd MMMM yyyy", e.g. "05 January 2026". */
  PeriodStart: string | null;
  PeriodEnd: string | null;
  PeriodTitleStr: string | null;
  DojangId: number | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** IsEntry "N" = the master-display variant (vs "Y" used when creating schedules). */
export function fetchSchedulePeriods(): Promise<SchPeriodRow[]> {
  return apiPost<SchPeriodRow[]>(
    "/master/get-schperiod",
    { objParam: { ObjSearch: NO_SEARCH, IsEntry: "N" } },
    { auth: true },
  );
}

export interface EBookRow {
  EBookMsId: number;
  BeltMasterId: number;
  BeltName: string | null;
  Vol: string | null;
  Title: string | null;
  EBookFile: string | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

export function fetchEbooks(): Promise<EBookRow[]> {
  return apiPost<EBookRow[]>(
    "/master/get-ebook",
    { objParam: { ObjSearch: NO_SEARCH, EBookMsId: null } },
    { auth: true },
  );
}
