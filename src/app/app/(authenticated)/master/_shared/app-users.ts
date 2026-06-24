// src/app/app/(authenticated)/master/_shared/app-users.ts
import type { Role } from "@/lib/roles";

export type UserStatus = "Active" | "Inactive";

export type AppUser = {
  id: number;
  name: string;
  username: string;
  password: string;
  role: Role;
  status: UserStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_USERS: AppUser[] = [
  { id: 1, name: "Fathir", username: "NA0001", password: "TKel0012", role: "admin", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: 2, name: "Devaloka Gangga", username: "NA0002", password: "DvG2024", role: "super-admin", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-20T10:00:00" },
  { id: 3, name: "Andre Wijaya", username: "NA0003", password: "AnW1990", role: "coach", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-15T14:30:00" },
  { id: 4, name: "Carolina Suteja", username: "NA0004", password: "CrS1985", role: "super-admin", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-10T11:00:00" },
  { id: 5, name: "Bayu Pratama", username: "NA0005", password: "ByP2023", role: "coach", status: "Active", updatedBy: "Andre", updateDate: "2025-11-25T09:00:00" },
  { id: 6, name: "Sari Indah", username: "NA0006", password: "Sr2024xy", role: "student", status: "Active", updatedBy: "Andre", updateDate: "2025-11-20T13:45:00" },
  { id: 7, name: "Reza Maulana", username: "NA0007", password: "Rz1995qq", role: "student", status: "Active", updatedBy: "Carolina", updateDate: "2025-11-15T08:30:00" },
  { id: 8, name: "Indah Permata", username: "NA0008", password: "IP2024ab", role: "admin", status: "Active", updatedBy: "Carolina", updateDate: "2025-11-10T16:20:00" },
  { id: 9, name: "Dimas Kurniawan", username: "NA0009", password: "Dm9988", role: "student", status: "Inactive", updatedBy: "Carolina", updateDate: "2025-10-05T12:00:00" },
];

// ---- mutable store ----
let _users: AppUser[] = [...INITIAL_USERS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getAppUsers(): AppUser[] {
  return _users;
}
export function subscribeAppUsers(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function updateAppUser(id: number, patch: Partial<AppUser>) {
  _users = _users.map((u) => (u.id === id ? { ...u, ...patch } : u));
  notify();
}
export function toggleAppUserStatus(id: number, by: string) {
  _users = _users.map((u) =>
    u.id === id
      ? {
          ...u,
          status: u.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : u,
  );
  notify();
}
