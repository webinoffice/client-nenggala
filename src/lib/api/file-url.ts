// src/lib/api/file-url.ts
//
// The backend stores uploaded files as relative paths (e.g. "Uploads/Content/
// banner-123.jpg", sometimes with Windows backslashes). Components need an
// absolute URL to render them. fileUrl() resolves a backend path against
// API_FILE_BASE_URL, while leaving already-absolute / app-local srcs untouched.
//
// NOTE (Section 3): next.config images.remotePatterns must allow
// API_FILE_BASE_URL for next/image to optimize these, and the backend must
// serve its Uploads/ directory over HTTP (it does not yet).
import { API_FILE_BASE_URL } from "./config";

export function fileUrl(path?: string | null): string {
  if (!path) return "";

  // Already a full URL, blob/data URL, or an app-local public asset.
  if (/^(https?:|blob:|data:)/.test(path) || path.startsWith("/images/") || path.startsWith("/videos/")) {
    return path;
  }

  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_FILE_BASE_URL}/${normalized}`;
}
