// src/app/app/(authenticated)/content/_shared/ContentSection.tsx
import type { ReactNode } from "react";

interface ContentSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Card wrapper used to group a block of CMS fields. */
export default function ContentSection({
  title,
  description,
  children,
}: ContentSectionProps) {
  return (
    <section className="bg-paper rounded-sm border border-ink/10 p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-widest text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
