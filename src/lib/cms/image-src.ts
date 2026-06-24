// src/lib/cms/image-src.ts
//
// In this mock phase CMS uploads become object URLs (blob:). next/image cannot
// run those through the optimizer, so callers pass `unoptimized` for blob srcs.
// Real uploads will return a normal URL/path and this helper becomes a no-op.

/** True when a src is a browser object URL produced by file upload. */
export function isBlobSrc(src: string): boolean {
  return src.startsWith("blob:");
}
