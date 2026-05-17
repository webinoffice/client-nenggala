// src/app/app/(authenticated)/dashboard/page.tsx
import PageHeader from "@/components/app/PageHeader";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Manage your academy from here."
      />
      <div className="rounded-sm bg-paper border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
        Dashboard widgets coming soon
      </div>
    </>
  );
}
