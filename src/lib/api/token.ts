// src/lib/api/token.ts
//
// Access-token storage for authenticated API calls. The backend issues a JWT
// access token from POST /auth/login (in objRes.accessToken) and keeps a
// refresh token in an httpOnly cookie.
//
// TODO(auth, audit issue #4): LoginForm is currently a stub and never stores a
// token. Once real login lands it must call setAccessToken() with the returned
// accessToken; until then getAccessToken() returns null and authenticated
// endpoints (the CMS reads/writes) will be rejected by the backend.
"use client";

const TOKEN_KEY = "nenggala.accessToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
