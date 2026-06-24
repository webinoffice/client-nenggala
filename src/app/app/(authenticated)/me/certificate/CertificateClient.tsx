// src/app/app/(authenticated)/me/certificate/CertificateClient.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Maximize2, X } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { getCurrentUsername } from "@/lib/current-user";
import {
  getCertifications,
  subscribeCertifications,
  formatCertDate,
  type Certification,
} from "@/lib/certifications";

export default function CertificateClient() {
  const { role } = useRole();
  const username = getCurrentUsername(role);
  const recipientType = role === "coach" ? "coach" : "student";

  const certifications = useSyncExternalStore(
    subscribeCertifications,
    getCertifications,
    getCertifications,
  );

  const myCertifications = certifications
    .filter(
      (c) =>
        c.recipientType === recipientType && c.recipientUsername === username,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const [lightbox, setLightbox] = useState<Certification | null>(null);

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
        Your Certification
      </h1>

      {myCertifications.length === 0 ? (
        <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
          No certifications yet
        </div>
      ) : (
        <div className="bg-paper rounded-sm border border-ink/10 divide-y divide-ink/10">
          {myCertifications.map((cert) => (
            <article
              key={cert.id}
              className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 md:gap-5"
            >
              <button
                onClick={() => setLightbox(cert)}
                className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-ink cursor-zoom-in"
                aria-label={`Expand certificate: ${cert.title}`}
              >
                <Image
                  src={cert.thumbnail}
                  alt={cert.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="180px"
                />
                {/* Hover overlay with expand icon */}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                  <Maximize2
                    size={24}
                    className="text-paper opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
              <div className="min-w-0">
                <h3 className="font-display text-base md:text-lg font-bold text-ink leading-snug">
                  {cert.title}
                </h3>
                <p className="text-xs text-ink/70 mt-1">
                  {formatCertDate(cert.date)}
                </p>
                <p className="text-sm text-ink/80 mt-2 leading-relaxed">
                  {cert.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <CertificateLightbox cert={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

function CertificateLightbox({
  cert,
  onClose,
}: {
  cert: Certification | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!cert) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prev;
    };
  }, [cert, onClose]);

  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="modal-overlay absolute inset-0 bg-ink/90"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="modal-content relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-paper hover:text-accent transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          aria-label="Close"
        >
          Close
          <X size={20} />
        </button>
        <div className="relative aspect-[4/3] w-full bg-ink rounded-sm overflow-hidden">
          <Image
            src={cert.fullImage}
            alt={cert.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
        <div className="mt-4 text-paper">
          <h2 className="font-display text-lg md:text-xl font-bold">
            {cert.title}
          </h2>
          <p className="text-xs text-paper/70 mt-1">
            {formatCertDate(cert.date)}
          </p>
        </div>
      </div>
    </div>
  );
}
