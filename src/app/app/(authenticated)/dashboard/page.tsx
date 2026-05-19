// src/app/app/(authenticated)/dashboard/DashboardRouter.tsx
"use client";

import { useRole } from "@/lib/role-context";
import StudentDashboard from "./StudentDashboard";
import PageHeader from "@/components/app/PageHeader";
import CoachDashboard from "./CoachDashboard";

export default function DashboardRouter() {
  const { role } = useRole();

  if (role === "student") {
    return <StudentDashboard />;
  }

  if (role === "coach") {
    return <CoachDashboard />;
  }

  // Admin / super-admin — placeholder until client provides specs.
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
