// src/lib/current-user.ts
import type { Role } from "./roles";

// Mock "logged-in user" per role. Replace with real session in Phase 2.
// We pick representative seed records so each role lands on data-rich screens.
export const CURRENT_USERNAME_BY_ROLE: Record<Role, string> = {
  "super-admin": "Carolina",
  admin: "Carolina",
  coach: "C0001",     // Marvin Hadi
  student: "U0006",   // Devaloka Gangga Avara — Red Stripe Black, rich score history
};

export const CURRENT_DISPLAY_NAME_BY_ROLE: Record<Role, string> = {
  "super-admin": "Carolina",
  admin: "Carolina",
  coach: "Marvin Hadi",
  student: "Devaloka Gangga",
};

export function getCurrentUsername(role: Role): string {
  return CURRENT_USERNAME_BY_ROLE[role];
}

export function getCurrentDisplayName(role: Role): string {
  return CURRENT_DISPLAY_NAME_BY_ROLE[role];
}