// src/lib/session.ts
//
// Authenticated session derived from the JWT access token. The token is the
// single source of truth for identity AND role: we decode its payload
// (UserName=No.Reg, UserTypeCode, DojangId, …) rather than keeping a separate
// role switcher. role-context.tsx and current-user.ts both read from here.
//
// Token payload (see backend AuthController.login):
//   { UserId, UserName (=UserNoId / No.Reg), UserDataId, UserTypeCode, DojangId, exp }
"use client";

import { useSyncExternalStore } from "react";
import { getAccessToken, setAccessToken, clearAccessToken } from "./api/token";
import { loginRequest, logoutRequest } from "./api/auth";
import type { Role } from "./roles";

// UserType.UserTypeCode (backend seed) → client Role.
const USER_TYPE_TO_ROLE: Record<string, Role> = {
  X: "super-admin",
  A: "admin",
  I: "coach",
  S: "student",
};

export interface Session {
  /** UserNoId — the login username and canonical identity (e.g. "NS00001"). */
  noReg: string;
  role: Role;
  userId: number;
  userDataId: number;
  /** null for super-admin (sees all dojang). */
  dojangId: number | null;
}

interface TokenPayload {
  UserId: number;
  UserName: string;
  UserDataId: number;
  UserTypeCode: string;
  DojangId: number | null;
  exp?: number;
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseToken(token: string): Session | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as TokenPayload;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null; // expired
    const role = USER_TYPE_TO_ROLE[payload.UserTypeCode];
    if (!role || !payload.UserName) return null;
    return {
      noReg: payload.UserName,
      role,
      userId: payload.UserId,
      userDataId: payload.UserDataId,
      dojangId: payload.DojangId ?? null,
    };
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // The browser's `storage` event fires on changes from OTHER tabs, keeping
  // sessions in sync across tabs (login/logout). Same-tab changes go via notify().
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

// useSyncExternalStore needs a stable snapshot reference, so cache the parsed
// session and only recompute when the raw token string actually changes.
let _cachedToken: string | null = null;
let _cachedSession: Session | null = null;

export function getSession(): Session | null {
  const token = getAccessToken();
  if (token !== _cachedToken) {
    _cachedToken = token;
    _cachedSession = token ? parseToken(token) : null;
  }
  return _cachedSession;
}

function getServerSession(): Session | null {
  return null;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, getServerSession);
}

/** Authenticate, persist the token, and return the resolved session. */
export async function login(noReg: string, password: string): Promise<Session> {
  const token = await loginRequest(noReg, password);
  setAccessToken(token);
  notify();
  const session = getSession();
  if (!session) {
    // Token came back but couldn't be decoded into a known role — treat as failure.
    clearAccessToken();
    notify();
    throw new Error("Login berhasil tetapi sesi tidak valid.");
  }
  return session;
}

/** Clear the session (server cookie + local token) and notify subscribers. */
export async function logout(): Promise<void> {
  await logoutRequest();
  clearAccessToken();
  notify();
}
