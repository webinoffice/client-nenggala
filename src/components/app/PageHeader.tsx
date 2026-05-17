// src/components/app/PageHeader.tsx
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted mt-2">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
