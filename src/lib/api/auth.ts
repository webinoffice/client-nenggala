// src/lib/api/auth.ts
//
// Auth network calls. The login endpoint is special: unlike every other
// endpoint it does NOT wrap its payload in objParam, and it returns the JWT on
// `objRes.accessToken` (NOT objRes.MsgData), so the generic apiPost unwrap in
// client.ts can't be reused here. logout is best-effort — it clears the backend
// refresh cookie; the client always drops its own token regardless.
import { API_BASE_URL } from "./config";
import { ApiError } from "./client";

interface LoginEnvelope {
  objRes?: {
    MsgCode: number;
    MsgDesc: string;
    accessToken?: string;
  };
}

/** POST /auth/login — returns the JWT access token on success. */
export async function loginRequest(
  userName: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UserName: userName, UserPassword: password }),
    credentials: "include",
  });

  let json: LoginEnvelope;
  try {
    json = (await res.json()) as LoginEnvelope;
  } catch {
    throw new ApiError(`Unexpected response (HTTP ${res.status})`, res.status);
  }

  const objRes = json?.objRes;
  if (!objRes) {
    throw new ApiError(`Malformed response (HTTP ${res.status})`, res.status);
  }
  if (objRes.MsgCode !== 0 || !objRes.accessToken) {
    throw new ApiError(objRes.MsgDesc || "Login failed", objRes.MsgCode);
  }
  return objRes.accessToken;
}

/** POST /auth/logout — clears the httpOnly refresh cookie. Best-effort. */
export async function logoutRequest(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Network failure on logout is non-fatal: the client token is cleared anyway.
  }
}
