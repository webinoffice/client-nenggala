// src/components/app/RoleGuard.tsx
"use client";

import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/roles";

interface RoleGuardProps {
  allow: Role[];
  children: ReactNode;
}

/**
 * Client-side route guard. Renders children only when the active role is
 * permitted; otherwise shows a "restricted" notice. Real enforcement arrives
 * with server-side auth — this mirrors the sidebar's role filtering so direct
 * URL access doesn't expose the page.
 */
export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { role } = useRole();

  if (!allow.includes(role)) {
    return (
      <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
          <ShieldAlert size={24} className="text-brand" />
        </div>
        <p className="font-display text-lg font-bold uppercase tracking-widest text-ink">
          Akses Dibatasi
        </p>
        <p className="text-sm text-muted mt-2">
          Halaman ini hanya dapat diakses oleh Super Admin.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
