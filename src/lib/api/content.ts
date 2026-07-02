// src/lib/api/content.ts
//
// Shapes + helpers for the CMS "content" model. One endpoint feeds a whole
// page as a bundle of typed sub-lists:
//
//   POST /public/get-content-perpage   (marketing — no token)
//   POST /content/get-content-perpage  (CMS — token; rows also carry ContentId)
//
// Only 6 content types exist in the backend: H Banner, Z Event Highlight,
// F Banner Bottom, O Our Moment, G Galery, E Event Section. Programs/dojang/
// coaches arrive on the public bundle from master tables (see Section 4).
import { apiPost, apiPostForm } from "./client";
import { getAccessToken } from "./token";

/** ContentType.ContentTypeId values (seeded; see backend nenggala.sql). */
export const CONTENT_TYPE = {
  BANNER: 1, // H — top banner (All, max 1)
  EVENT_HIGHLIGHT: 2, // Z — featured event (All, max 1)
  BANNER_BOTTOM: 3, // F — bottom banner (HomePage, max 1)
  OUR_MOMENT: 4, // O — Our Moment videos (Galery)
  GALLERY: 5, // G — gallery images (Galery)
  EVENT: 6, // E — event-section rows (Event)
} as const;

export interface ContentRow {
  /** Present only on the authenticated read; needed to edit/delete (Section 2). */
  ContentId?: number;
  ContentTypeId?: number;
  ContentTitle: string | null;
  ContentDesc: string | null;
  ContentFile: string | null;
  ContentLink: string | null;
  FgHighlight: string | null;
  /** Backend-formatted as "%e %M %Y", e.g. "24 November 2019" — not ISO. */
  ContentDate: string | null;
  ContentTypeCode: string;
  ContentTypeName: string;
  FgEdit: string;
  /** Explicit display order (gallery/carousel reorder). Null = unordered. */
  ContentSeq?: number | null;
  /** "Y"/"N" active flag (event enable/disable). Present on the authed read. */
  FgActive?: string | null;
}

// ---- public master-derived bundles (Sections 4 & 5) ----
// The public read inlines master data with a trimmed column set.
export interface PublicProgramRow {
  MsIndex: number; // = ProgramMsId
  ProgramName: string;
  ProgramMsImage: string | null;
}
export interface PublicSubProgramRow {
  MsIndex: number; // = parent ProgramMsId
  ProgramName: string;
  ProgramDtName: string;
  ProgramDtImage: string | null;
}
export interface PublicDojangRow {
  DojangName: string;
  DojangImage: string | null;
}
export interface PublicCoachRow {
  UserName: string;
  UserPhoto: string | null;
  FgAssist: string | null; // "Y" => assistant coach
  BeltName: string | null;
}

export interface ContentPageResponse {
  ObjBanner?: ContentRow[];
  ObjEventHighlight?: ContentRow[];
  ObjBannerBottom?: ContentRow[];
  ObjGallery?: ContentRow[];
  ObjOurMoment?: ContentRow[];
  ObjEvent?: ContentRow[];
  // Master-derived (public bundle only).
  ObjProgram?: PublicProgramRow[];
  ObjSubProgram?: PublicSubProgramRow[];
  ObjDojang?: PublicDojangRow[];
  ObjCoach?: PublicCoachRow[];
}

export type ContentPageName =
  | "HomePage"
  | "AboutUs"
  | "Galery"
  | "Event"
  | "Program"
  | "Product";

/**
 * Fetch a content-page bundle. Uses the authenticated /content endpoint when a
 * token is present (rows include ContentId/ContentTypeId, which the CMS needs),
 * otherwise the public endpoint used by the marketing site.
 *
 * IMPORTANT: pass `forcePublic` for marketing reads. The authenticated endpoint
 * responds with isPublic="N" and OMITS the public master-derived bundles
 * (ObjProgram / ObjSubProgram / ObjDojang / ObjCoach / ObjProduct[Type]). Since
 * a CMS super-admin browsing the public site still has a token in localStorage,
 * those marketing sections would silently come back empty without this flag.
 */
const _inflight = new Map<string, Promise<ContentPageResponse>>();

export async function fetchContentPage(
  page: ContentPageName,
  opts: { forcePublic?: boolean } = {},
): Promise<ContentPageResponse> {
  const authed = !opts.forcePublic && !!getAccessToken();
  const path = authed
    ? "/content/get-content-perpage"
    : "/public/get-content-perpage";

  // De-dupe the burst of identical requests when several stores hydrate on the
  // same page mount. The entry clears on settle so post-write reloads are fresh.
  const key = `${authed ? "A" : "P"}:${page}`;
  const existing = _inflight.get(key);
  if (existing) return existing;

  const promise = apiPost<ContentPageResponse>(
    path,
    { objParam: { ContentPage: page } },
    { auth: authed },
  ).finally(() => {
    _inflight.delete(key);
  });
  _inflight.set(key, promise);
  return promise;
}

// ---- writes (CMS, super-admin; require a token) ----

export interface SaveContentParams {
  ContentId: number; // 0 when inserting
  ContentTitle: string;
  ContentDesc: string;
  ContentLink: string;
  ContentTypeId: number;
  ContentDate: string | null; // "YYYY-MM-DD" for events, else null
  FgHighlight: "Y" | "N";
  FgMode: "I" | "E";
}

/**
 * Create/update a content row. The image rides inline as multipart field
 * "ContentFile" (the backend has no separate upload endpoint). On edit the
 * backend deletes the previous file, so a file must be supplied each save.
 *
 * objParam is sent as a JSON string (the standard multipart convention).
 * PREREQUISITE: the backend currently reads `req.body.objParam` directly, which
 * only works for JSON requests — for these multipart endpoints it must first
 * `JSON.parse(req.body.objParam)`. See the Step 3a notes.
 */
export async function saveContent(
  params: SaveContentParams,
  file: File | null,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (file) form.append("ContentFile", file);
  await apiPostForm<void>("/content/save-content", form, { auth: true });
}

/** Persist a new display order for content rows (gallery reorder). */
export async function saveContentOrder(
  items: { ContentId: number; ContentSeq: number }[],
): Promise<void> {
  await apiPost<void>(
    "/content/save-content-order",
    { objParam: { Items: items } },
    { auth: true },
  );
}

/** Enable/disable a content row (event status). */
export async function toggleContentStatus(
  contentId: number,
  active: boolean,
): Promise<void> {
  await apiPost<void>(
    "/content/toggle-content-status",
    { objParam: { ContentId: contentId, FgActive: active ? "Y" : "N" } },
    { auth: true },
  );
}

export async function deleteContent(contentId: number): Promise<void> {
  await apiPost<void>(
    "/content/delete-content",
    { objParam: { ContentId: contentId } },
    { auth: true },
  );
}

/** Parse the backend's "%e %M %Y" date ("24 November 2019") into ISO yyyy-mm-dd. */
export function parseContentDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
