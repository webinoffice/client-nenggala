// src/lib/api/config.ts
//
// Static configuration for the backend (backend-nenggala) integration. Values
// come from NEXT_PUBLIC_* env vars (see .env.example) so they can differ per
// environment; the fallbacks match a local backend on :5000.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** Origin that serves uploaded files (the backend's Uploads/ directory). */
export const API_FILE_BASE_URL =
  process.env.NEXT_PUBLIC_API_FILE_BASE_URL ?? "http://localhost:5000";
