// src/app/app/(authenticated)/me/score/page.tsx
import PageHeader from "@/components/app/PageHeader";

export default function MyScorePage() {
  return (
    <>
      <PageHeader
        title="My Score"
        description="Your score history across periods."
      />
      <div className="rounded-sm bg-paper border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
        Score history coming soon
      </div>
    </>
  );
}
