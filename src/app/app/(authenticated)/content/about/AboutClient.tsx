// src/app/app/(authenticated)/content/about/AboutClient.tsx
"use client";

import PageHeader from "@/components/app/PageHeader";
import ContentSection from "../_shared/ContentSection";
import GalleryManager from "../_shared/GalleryManager";

/**
 * About CMS. The backend only stores the shared gallery for this page — the
 * profile text, video, and facilities have no backend representation and are
 * static (Section 3a decision), and coaches are managed via User Management.
 * So this editor manages only the gallery.
 */
export default function AboutClient() {
  return (
    <>
      <PageHeader
        title="About"
        description="Edit the about-page gallery. The profile, facilities, and coaches are managed elsewhere."
      />

      <div className="space-y-6">
        <ContentSection
          title="Gallery"
          description="The carousel shown on the about page (shared with the homepage)."
        >
          <GalleryManager />
        </ContentSection>
      </div>
    </>
  );
}
