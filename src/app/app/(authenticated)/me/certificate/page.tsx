// src/app/app/(authenticated)/me/certificate/page.tsx
import PageHeader from "@/components/app/PageHeader";

export default function MyCertificatePage() {
  return (
    <>
      <PageHeader
        title="Certificate"
        description="Your earned certificates and belts."
      />
      <div className="rounded-sm bg-paper border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
        Certificates coming soon
      </div>
    </>
  );
}
