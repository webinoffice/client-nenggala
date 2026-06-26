// src/lib/api/master.ts
//
// Typed fetchers for the authenticated master endpoints (backend-nenggala
// /master/*). Every list endpoint replies with MsgData = the row array; rows
// carry the table's numeric PK, an FgStatus ("Y"/"N") and a pre-formatted
// UpdateDate string ("dd/mm/yyyy HH:mm:ss"). These read the FULL list
// (FgStatus "" = both active + inactive) so the master CRUD screens can show
// and toggle inactive rows.
//
// NOTE (Step 3c #5): writes are being wired here. Plain-JSON writes (schperiod)
// use apiPost; the image-bearing master saves are multipart (apiPostForm,
// objParam as a JSON-string field + the file field) and depend on the backend
// objParam-parse + Uploads static-serving prerequisites.
import { apiPost, apiPostForm } from "./client";

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

export interface ProductTypeRow {
  ProductTypeId: number;
  ProductTypeName: string;
  FgStatus: string;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-product-type — used to populate the product Type dropdown with real ids
 *  (FgStatus "Y" = active only). There is no product-type management screen yet,
 *  so the save/inact-product-type endpoints stay unwired (flagged). */
export function fetchProductTypes(): Promise<ProductTypeRow[]> {
  return apiPost<ProductTypeRow[]>(
    "/master/get-product-type",
    { objParam: { ObjSearch: NO_SEARCH, FgStatus: "Y" } },
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

// ===========================================================================
// Writes
// ===========================================================================
// FgMode "I" = insert, "E" = edit. The backend stamps UpdatedBy from the bearer
// token, so the client value only affects the optimistic pre-reload row. Image
// writes ride as a multipart file field alongside an objParam JSON string; the
// plain writes below (schperiod) post JSON.

// ---- schedule period (plain JSON) ----

export interface SchPeriodSaveParams {
  /** 0 when inserting. */
  SchPeriodId: number;
  DojangId: number;
  /** "YYYY-MM-DD". On insert the backend auto-assigns PeriodCount per dojang. */
  PeriodStart: string;
  PeriodEnd: string;
  PeriodTitle: string;
  FgMode: "I" | "E";
}

/** save-schperiod — insert/edit. The backend validates overlap and (on edit)
 *  that no existing schedule extends past the new end; both surface as errors. */
export function saveSchPeriod(params: SchPeriodSaveParams): Promise<void> {
  return apiPost<void>(
    "/master/save-schperiod",
    { objParam: params },
    { auth: true },
  );
}

/** delete-schperiod — hard delete, rejected by the backend when the period is
 *  already referenced by a schedule. */
export function deleteSchPeriod(schPeriodId: number): Promise<void> {
  return apiPost<void>(
    "/master/delete-schperiod",
    { objParam: { SchPeriodId: schPeriodId } },
    { auth: true },
  );
}

// ---- program (multipart save + status toggle) ----
// The image rides as multipart field "ProgramMsImage" (objParam is the standard
// JSON string). The backend keeps the existing image when no file is sent on
// edit, so the file is optional when editing.

export interface ProgramMsSaveParams {
  ProgramMsId: number; // 0 when inserting
  ProgramName: string;
  FgMode: "I" | "E";
}

export function saveProgramMs(
  params: ProgramMsSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("ProgramMsImage", file);
  return apiPostForm<void>("/master/save-programms", form, { auth: true });
}

/** inact-programms — status toggle ("Y" active / "N" inactive). */
export function inactProgramMs(
  programMsId: number,
  fgStatus: "Y" | "N",
): Promise<void> {
  return apiPost<void>(
    "/master/inact-programms",
    { objParam: { ProgramMsId: programMsId, FgStatus: fgStatus } },
    { auth: true },
  );
}

// ---- sub-program (multipart save + status toggle) ----
// Image field "ProgramDtImage"; same keep-existing-image-on-edit guard as
// programs.

export interface ProgramDtSaveParams {
  ProgramDtId: number; // 0 when inserting
  ProgramMsId: number; // parent program
  ProgramDtName: string;
  FgMode: "I" | "E";
}

export function saveProgramDt(
  params: ProgramDtSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("ProgramDtImage", file);
  return apiPostForm<void>("/master/save-programdt", form, { auth: true });
}

/** inact-programdt — status toggle ("Y" active / "N" inactive). */
export function inactProgramDt(
  programDtId: number,
  fgStatus: "Y" | "N",
): Promise<void> {
  return apiPost<void>(
    "/master/inact-programdt",
    { objParam: { ProgramDtId: programDtId, FgStatus: fgStatus } },
    { auth: true },
  );
}

// ---- dojang (multipart save + status toggle) ----
// Image field "DojangImage". The backend now persists DojangImage on edit and
// keeps the existing image when no file is sent.

export interface DojangSaveParams {
  DojangId: number; // 0 when inserting
  DojangName: string;
  FgMode: "I" | "E";
}

export function saveDojang(
  params: DojangSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("DojangImage", file);
  return apiPostForm<void>("/master/save-dojang", form, { auth: true });
}

/** inact-dojang — status toggle ("Y" active / "N" inactive). */
export function inactDojang(
  dojangId: number,
  fgStatus: "Y" | "N",
): Promise<void> {
  return apiPost<void>(
    "/master/inact-dojang",
    { objParam: { DojangId: dojangId, FgStatus: fgStatus } },
    { auth: true },
  );
}

// ---- product (multipart save + HARD delete) ----
// Image field "ProductImage"; same keep-existing-image-on-edit guard. Product
// has no status column — delete-product is a hard delete (rejected by nothing
// server-side today, but surfaced via the consumer's error Modal for parity).

export interface ProductSaveParams {
  ProductId: number; // 0 when inserting
  ProductTypeId: number;
  ProductName: string;
  ProductLink: string;
  FgMode: "I" | "E";
}

export function saveProduct(
  params: ProductSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("ProductImage", file);
  return apiPostForm<void>("/master/save-product", form, { auth: true });
}

/** delete-product — hard delete (also unlinks the image file). */
export function deleteProduct(productId: number): Promise<void> {
  return apiPost<void>(
    "/master/delete-product",
    { objParam: { ProductId: productId } },
    { auth: true },
  );
}

// ---- ebook (multipart insert + HARD delete) ----
// saveEBookMs is insert-only on the backend (no edit path), so the ebook form is
// insert + delete only. The PDF rides as multipart field "EBookFile".

export interface EBookSaveParams {
  EBookMsId: number; // 0 (insert only)
  BeltMasterId: number;
  Vol: string | null;
  Title: string;
  FgMode: "I";
}

export function saveEBook(
  params: EBookSaveParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("EBookFile", file);
  return apiPostForm<void>("/master/save-ebook", form, { auth: true });
}

/** delete-ebook — hard delete (also unlinks the PDF file). */
export function deleteEBook(eBookMsId: number): Promise<void> {
  return apiPost<void>(
    "/master/delete-ebook",
    { objParam: { EBookMsId: eBookMsId } },
    { auth: true },
  );
}
