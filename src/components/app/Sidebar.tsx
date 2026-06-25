// src/components/app/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { logout } from "@/lib/session";
import {
  SIDEBAR_ITEMS,
  filterSidebarByRole,
  isGroupItem,
} from "./sidebar-config";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useRole();
  const items = filterSidebarByRole(SIDEBAR_ITEMS, role);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const activeGroups = useMemo(
    () =>
      new Set(
        items
          .filter(isGroupItem)
          .filter((g) => g.children.some((c) => pathname.startsWith(c.href)))
          .map((g) => g.label),
      ),
    [items, pathname],
  );

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const isGroupOpen = (label: string) =>
    label in overrides ? overrides[label] : activeGroups.has(label);

  const toggleGroup = (label: string) => {
    setOverrides((prev) => {
      const current = label in prev ? prev[label] : activeGroups.has(label);
      return { ...prev, [label]: !current };
    });
  };

  const leafClasses = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium text-ink hover:bg-paper-soft transition-colors",
      active &&
        "bg-brand/5 text-brand font-bold shadow-[inset_3px_0_0_0_var(--color-brand)]",
    );

  return (
    <aside className="w-64 shrink-0 bg-paper border-r border-ink/10 flex flex-col">
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;

            if (isGroupItem(item)) {
              const open = isGroupOpen(item.label);
              const hasActive = activeGroups.has(item.label);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-sm text-sm font-medium text-ink hover:bg-paper-soft transition-colors",
                      hasActive &&
                        "text-brand font-bold shadow-[inset_3px_0_0_0_var(--color-brand)] bg-brand/5",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} />
                      {item.label}
                    </span>
                    <ChevronRight
                      size={16}
                      className={cn(
                        "transition-transform",
                        open && "rotate-90",
                      )}
                    />
                  </button>
                  {open && (
                    <ul className="mt-0.5 space-y-0.5">
                      {item.children.map((child) => {
                        const active = pathname.startsWith(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "block pl-12 pr-4 py-2 rounded-sm text-sm text-ink/70 hover:text-ink hover:bg-paper-soft transition-colors",
                                active &&
                                  "text-brand font-bold bg-brand/5 shadow-[inset_3px_0_0_0_var(--color-brand)]",
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={leafClasses(active)}>
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-ink/10 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium text-ink hover:bg-paper-soft transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
