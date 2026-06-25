// src/lib/api/client.ts
//
// Thin fetch wrapper for the Nenggala backend. Every endpoint replies with the
// same envelope:
//
//   { objRes: { MsgCode, MsgDesc, MsgData? } }    // MsgCode === 0 means success
//
// These helpers unwrap that envelope, returning MsgData on success and throwing
// ApiError otherwise. Public reads pass auth:false; CMS reads/writes pass
// auth:true to attach the bearer token (see token.ts).
import { API_BASE_URL } from "./config";
import { getAccessToken } from "./token";

interface ApiEnvelope<T> {
  objRes?: {
    MsgCode: number;
    MsgDesc: string;
    MsgData?: T;
  };
}

export class ApiError extends Error {
  /** Backend MsgCode (or the HTTP status when the response wasn't an envelope). */
  readonly code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

interface RequestOptions {
  /** Attach the bearer token. Defaults to false (public). */
  auth?: boolean;
}

function authHeaders(auth: boolean | undefined): Record<string, string> {
  if (!auth) return {};
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function unwrap<T>(res: Response): Promise<T> {
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(`Unexpected response (HTTP ${res.status})`, res.status);
  }

  const objRes = json?.objRes;
  if (!objRes) {
    throw new ApiError(`Malformed response (HTTP ${res.status})`, res.status);
  }
  if (objRes.MsgCode !== 0) {
    throw new ApiError(objRes.MsgDesc || "Request failed", objRes.MsgCode);
  }
  return objRes.MsgData as T;
}

/** POST a JSON body. */
export async function apiPost<T>(
  path: string,
  body: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(opts.auth) },
    body: JSON.stringify(body ?? {}),
    credentials: "include",
  });
  return unwrap<T>(res);
}

/**
 * POST a multipart/form-data body (file uploads). Content-Type is intentionally
 * left unset so the browser adds the multipart boundary. Defaults to auth:true
 * since the only multipart endpoints are the authenticated CMS/master writes.
 */
export async function apiPostForm<T>(
  path: string,
  form: FormData,
  opts: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(opts.auth ?? true),
    body: form,
    credentials: "include",
  });
  return unwrap<T>(res);
}
