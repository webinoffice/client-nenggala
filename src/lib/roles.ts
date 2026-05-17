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
