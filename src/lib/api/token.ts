// src/lib/api/token.ts
//
// Access-token storage for authenticated API calls. The backend issues a JWT
// access token from POST /auth/login (in objRes.accessToken) and keeps a
// refresh token in an httpOnly cookie.
//
// The token lives in localStorage so it survives a page refresh and is shared
// across tabs (session.ts listens for the `storage` event). LoginForm →
// session.login() calls setAccessToken() with the returned accessToken; logout
// clears it. Note: there is no automatic access-token refresh yet — when the JWT
// exp passes, session.parseToken() treats it as logged-out on the next refresh.
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
