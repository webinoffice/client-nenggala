// src/components/app/AuthGate.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";

/**
 * Client-side session gate for the authenticated app. Renders children only
 * when a valid session token is present; otherwise redirects to the login page.
 * On the server (and during hydration) the session snapshot is null, so the
 * subtree renders nothing until the client confirms a session — this avoids a
 * flash of the app shell for logged-out users.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/app/login");
    }
  }, [session, router]);

  if (!session) return null;
  return <>{children}</>;
}
