// src/lib/role-context.tsx
"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { isValidRole, type Role } from "./roles";

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);
const STORAGE_KEY = "nenggala-dev-role";
const DEFAULT_ROLE: Role = "super-admin";

// In-tab listeners. The browser's `storage` event only fires across tabs,
// so we need our own notifier for same-tab changes.
const inTabListeners = new Set<() => void>();

function subscribe(callback: () => void) {
  inTabListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    inTabListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notify() {
  inTabListeners.forEach((l) => l());
}

function getSnapshot(): Role {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isValidRole(stored) ? stored : DEFAULT_ROLE;
}

function getServerSnapshot(): Role {
  return DEFAULT_ROLE;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setRole = (r: Role) => {
    window.localStorage.setItem(STORAGE_KEY, r);
    notify();
  };

  return <RoleContext value={{ role, setRole }}>{children}</RoleContext>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
