// src/app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-[120px] md:text-[180px] font-bold leading-none tracking-tight text-brand">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-bold uppercase tracking-widest text-ink">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm text-muted">
          The page you&apos;re looking for has wandered off the mat. Let&apos;s
          get you back to known territory.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="md" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button variant="primary" size="md" href="/">
            <Home size={16} />
            Home
          </Button>
        </div>
      </div>
    </main>
  );
}
