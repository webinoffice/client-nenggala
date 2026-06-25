// src/lib/current-user.ts
//
// Identity of the logged-in user, derived from the authenticated session token
// (No.Reg). The JWT does not carry a human display name yet, so the display
// falls back to the No.Reg until the user store is wired (step 3c).
import { getSession } from "./session";

/** The authenticated user's No.Reg (login username), or "" if logged out. */
export function getCurrentUsername(): string {
  return getSession()?.noReg ?? "";
}

/** Best-available display label for the authenticated user (No.Reg for now). */
export function getCurrentDisplayName(): string {
  return getSession()?.noReg ?? "";
}
