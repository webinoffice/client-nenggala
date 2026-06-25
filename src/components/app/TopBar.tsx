// src/components/app/TopBar.tsx
"use client";

import Link from "next/link";
import { getCurrentDisplayName } from "@/lib/current-user";

export default function TopBar() {
  const displayName = getCurrentDisplayName();

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

        <div className="flex items-center gap-3">
          <span className="font-display text-xs uppercase tracking-widest font-bold">
            {displayName}
          </span>
          <div className="h-9 w-9 rounded-full bg-paper-soft overflow-hidden flex items-center justify-center text-ink text-sm font-bold font-display">
            {displayName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
