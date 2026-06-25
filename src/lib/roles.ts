// src/lib/roles.ts
export type Role = "super-admin" | "admin" | "coach" | "student";

export const ROLES: Role[] = ["super-admin", "admin", "coach", "student"];

export const ROLE_LABELS: Record<Role, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  coach: "Coach",
  student: "Student",
};

export function isValidRole(value: string): value is Role {
  return (ROLES as string[]).includes(value);
}

// UserType.UserTypeCode (backend seed) → client Role. Mirrors session.ts.
const USER_TYPE_TO_ROLE: Record<string, Role> = {
  X: "super-admin",
  A: "admin",
  I: "coach",
  S: "student",
};

export function roleFromUserTypeCode(code: string | null | undefined): Role {
  return USER_TYPE_TO_ROLE[(code ?? "").trim()] ?? "student";
}

/** Inverse of roleFromUserTypeCode — the UserTypeCode for a given Role. */
export const ROLE_TO_USER_TYPE: Record<Role, "X" | "A" | "I" | "S"> = {
  "super-admin": "X",
  admin: "A",
  coach: "I",
  student: "S",
};
