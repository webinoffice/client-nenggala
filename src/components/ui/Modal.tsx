// src/components/ui/Modal.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-ink/60"
        onClick={onClose}
      />
      <div
        className={cn(
          "modal-content relative w-full bg-paper rounded-sm shadow-xl",
          SIZE_CLASSES[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-display text-lg font-bold uppercase tracking-widest text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors p-1 rounded-sm hover:bg-paper-soft"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-ink/10 px-6 py-3 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
