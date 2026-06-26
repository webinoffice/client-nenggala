// src/components/app/AuthGate.tsx
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";

// True only after client hydration (false on the server and on the first client
// render). Lets us tell "session not read yet" apart from "logged out" without a
// setState-in-effect. After hydration, useSyncExternalStore re-reads the real
// token, so `session` is settled by the time this flips to true.
const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Client-side session gate for the authenticated app. Renders children only
 * when a valid session token is present; otherwise redirects to the login page.
 *
 * The session is derived from a localStorage token, which the server can't read,
 * so `useSession()` returns null on the server AND on the very first client
 * (hydration) render. That initial null is "unknown", NOT "logged out" — acting
 * on it would bounce an authenticated user to /login on every refresh. We defer
 * the decision until after mount: by the time the mount effect sets `hydrated`,
 * useSyncExternalStore has already re-read the real token, so `session` reflects
 * the actual login state and we only redirect a genuinely logged-out user.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) {
      router.replace("/app/login");
    }
  }, [hydrated, session, router]);

  if (!session) return null;
  return <>{children}</>;
}
