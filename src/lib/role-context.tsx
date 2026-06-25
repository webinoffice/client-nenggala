// src/lib/role-context.tsx
//
// Role now derives from the authenticated session token (see session.ts) rather
// than a manual dev switcher. useRole() is kept as the role accessor so existing
// consumers (Sidebar, Breadcrumb, RoleGuard, dashboards…) don't change.
"use client";

import { useSession } from "./session";
import type { Role } from "./roles";

const FALLBACK_ROLE: Role = "student";

/**
 * Returns the role of the authenticated user. Within the authenticated app the
 * AuthGate guarantees a session, so `role` is always the real one; the fallback
 * only covers the brief window during logout before the redirect lands.
 */
export function useRole(): { role: Role } {
  const session = useSession();
  return { role: session?.role ?? FALLBACK_ROLE };
}
