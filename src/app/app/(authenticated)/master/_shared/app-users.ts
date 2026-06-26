// src/app/app/(authenticated)/master/_shared/app-users.ts
import type { Role } from "@/lib/roles";
import { roleFromUserTypeCode, ROLE_TO_USER_TYPE } from "@/lib/roles";
import {
  fetchUserDataMany,
  inactUserData,
  updateUserPassword,
  updateUserRole,
} from "@/lib/api/users";
import { dmyhmsToIso } from "@/lib/api/dates";

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
  ensureAppUsersLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
// The roles master spans every user type, so it fans out get-user-data across
// X/A/I/S and merges. `id` is the User-table PK (for the status-toggle write);
// the backend never returns passwords, so `password` stays blank here.
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadAppUsers(): Promise<void> {
  const rows = await fetchUserDataMany(["X", "A", "I", "S"]);
  _users = rows.map((r) => ({
    id: r.UserId,
    name: r.UserName ?? "",
    username: r.UserNoId,
    password: "",
    role: roleFromUserTypeCode(r.UserTypeCode),
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the app-user (roles) list from the backend. */
export function ensureAppUsersLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadAppUsers()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load app users", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the app-user list (used after a write). */
export async function reloadAppUsers(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureAppUsersLoaded();
}
// ---- writes (update-user-role + update-user-password + inact-user-data) ----
// The roles screen edits role and/or password; each maps to its own endpoint
// (only sent when actually changed), then we reload. Name/username are fixed and
// full-profile edits live in the registration flow, not here.

export async function updateAppUser(
  id: number,
  changes: { role?: Role; password?: string },
) {
  try {
    if (changes.role) {
      await updateUserRole(id, ROLE_TO_USER_TYPE[changes.role]);
    }
    if (changes.password && changes.password.trim() !== "") {
      await updateUserPassword(id, changes.password);
    }
    await reloadAppUsers();
  } catch (err) {
    console.error("Failed to update user", err);
  }
}

export async function toggleAppUserStatus(id: number, current: UserStatus) {
  try {
    await inactUserData(id, current === "Active" ? "N" : "Y");
    await reloadAppUsers();
  } catch (err) {
    console.error("Failed to change user status", err);
  }
}
