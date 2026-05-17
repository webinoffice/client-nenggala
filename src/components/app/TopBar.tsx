// src/components/app/TopBar.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { ROLES, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="bg-ink text-paper">
      <div className="h-16 px-6 flex items-center justify-between">
        <Link
          href="/app/dashboard"
          className="font-display tracking-widest text-xl leading-none"
        >
          <span className="block font-bold">NENGGALA</span>
          <span className="block text-[10px] tracking-[0.3em] text-paper/60 -mt-0.5 font-bold">
            ACADEMY
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Dev-only role switcher */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-sm border border-paper/20 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:bg-paper/5 transition-colors"
            >
              <span className="text-accent">DEV</span>
              <span className="text-paper/80">{ROLE_LABELS[role]}</span>
              <ChevronDown
                size={14}
                className={cn("transition-transform", open && "rotate-180")}
              />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-sm bg-paper text-ink shadow-xl border border-ink/10 overflow-hidden z-50">
                <div className="px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-muted border-b border-ink/10">
                  Switch role (dev)
                </div>
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs uppercase tracking-widest font-bold hover:bg-paper-soft transition-colors",
                      r === role && "bg-brand/5 text-brand",
                    )}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-xs uppercase tracking-widest font-bold">
              Carolina
            </span>
            <div className="h-9 w-9 rounded-full bg-paper-soft overflow-hidden flex items-center justify-center text-ink text-sm font-bold font-display">
              C
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
