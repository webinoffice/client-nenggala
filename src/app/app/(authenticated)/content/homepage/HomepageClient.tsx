// src/app/app/(authenticated)/content/homepage/HomepageClient.tsx
"use client";

import { useMemo } from "react";
import PageHeader from "@/components/app/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ImageUploadField from "@/components/app/ImageUploadField";
import {
  useHomepageContent,
  updateHomepageContent,
} from "@/lib/cms/homepage";
import { useEvents } from "@/lib/events";
import ContentSection from "../_shared/ContentSection";
import GalleryManager from "../_shared/GalleryManager";

export default function HomepageClient() {
  const content = useHomepageContent();
  const events = useEvents();

  const activeEvents = useMemo(
    () => events.filter((e) => e.status === "Active"),
    [events],
  );

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit the homepage banners, gallery, and highlighted event. Changes apply immediately."
      />

      <div className="space-y-6">
        <ContentSection
          title="Banners"
          description="Top banner appears at the very top of the homepage; the bottom banner sits above the event highlight."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <ImageUploadField
                label="Top Banner"
                value={content.topBanner.src}
                onChange={(src) =>
                  updateHomepageContent({
                    topBanner: { ...content.topBanner, src },
                  })
                }
                aspectClassName="aspect-[1920/900]"
              />
              <Input
                label="Top Banner Alt Text"
                value={content.topBanner.alt}
                onChange={(e) =>
                  updateHomepageContent({
                    topBanner: { ...content.topBanner, alt: e.target.value },
                  })
                }
                placeholder="Describe the banner"
              />
            </div>
            <div className="space-y-3">
              <ImageUploadField
                label="Bottom Banner"
                value={content.bottomBanner.src}
                onChange={(src) =>
                  updateHomepageContent({
                    bottomBanner: { ...content.bottomBanner, src },
                  })
                }
                aspectClassName="aspect-[1920/600]"
              />
              <Input
                label="Bottom Banner Alt Text"
                value={content.bottomBanner.alt}
                onChange={(e) =>
                  updateHomepageContent({
                    bottomBanner: {
                      ...content.bottomBanner,
                      alt: e.target.value,
                    },
                  })
                }
                placeholder="Describe the banner"
              />
            </div>
          </div>
        </ContentSection>

        <ContentSection
          title="Event Highlight"
          description="The event featured in the homepage highlight banner."
        >
          <div className="max-w-md">
            <Select
              label="Highlighted Event"
              value={content.highlightEventId}
              onChange={(e) =>
                updateHomepageContent({ highlightEventId: e.target.value })
              }
            >
              {activeEvents.length === 0 ? (
                <option value="">No active events</option>
              ) : (
                activeEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))
              )}
            </Select>
          </div>
        </ContentSection>

        <ContentSection
          title="Gallery"
          description="The carousel shown on the homepage (and reused on the about page)."
        >
          <GalleryManager />
        </ContentSection>
      </div>
    </>
  );
}
