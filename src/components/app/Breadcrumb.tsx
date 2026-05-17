// src/components/app/Breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { ROLE_LABELS } from "@/lib/roles";
import { getCurrentSection } from "./sidebar-config";

export default function Breadcrumb() {
  const pathname = usePathname();
  const { role } = useRole();
  const section = getCurrentSection(pathname);

  return (
    <div className="bg-ink-soft px-6 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-accent">
      <span>{ROLE_LABELS[role]}</span>
      <span className="mx-3 text-accent/40">—</span>
      <span>{section}</span>
    </div>
  );
}
