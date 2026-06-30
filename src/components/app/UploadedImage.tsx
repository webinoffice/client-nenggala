// src/components/app/UploadedImage.tsx
//
// Renders a backend-served uploaded image (an absolute URL from fileUrl(), e.g.
// http://localhost:5000/Uploads/...). These deliberately bypass next/image: its
// optimizer rejects the backend host unless remotePatterns is configured AND the
// dev server restarted, and for internal CMS uploads optimization adds little.
// A plain <img> renders the static file directly (the backend serves /Uploads).
// next/image is kept for app-local /images/* assets that benefit from optimizing.

interface UploadedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Set "eager" for above-the-fold images; defaults to lazy (off-screen defer). */
  loading?: "lazy" | "eager";
  /** Pass false to suppress drag-ghosting (e.g. inside carousels). */
  draggable?: boolean;
}

export default function UploadedImage({
  src,
  alt,
  className,
  loading = "lazy",
  draggable,
}: UploadedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      draggable={draggable}
    />
  );
}
