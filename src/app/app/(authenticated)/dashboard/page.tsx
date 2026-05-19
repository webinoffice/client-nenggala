// src/app/app/(authenticated)/dashboard/DashboardRouter.tsx
"use client";

import { useRole } from "@/lib/role-context";
import StudentDashboard from "./StudentDashboard";
import PageHeader from "@/components/app/PageHeader";

export default function DashboardRouter() {
  const { role } = useRole();

  if (role === "student") {
    return <StudentDashboard />;
  }

  // Admin / super-admin / coach — placeholder until client provides specs.
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
