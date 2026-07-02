// src/app/app/(authenticated)/dashboard/DashboardRouter.tsx
"use client";

import { LayoutDashboard } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { getCurrentDisplayName } from "@/lib/current-user";
import StudentDashboard from "./StudentDashboard";
import CoachDashboard from "./CoachDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardRouter() {
  const { role } = useRole();

  if (role === "student") {
    return <StudentDashboard />;
  }

  if (role === "coach") {
    return <CoachDashboard />;
  }

  // The metrics dashboard is a super-admin view (its backend endpoint is X-only
  // and its numbers are dojang-wide). A dojang admin gets a simple landing
  // placeholder and works from the sidebar sections instead.
  if (role === "super-admin") {
    return <AdminDashboard />;
  }

  return <AdminPlaceholder />;
}

function AdminPlaceholder() {
  const displayName = getCurrentDisplayName();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage your dojang from the sidebar.
        </p>
      </div>

      <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
          <LayoutDashboard size={24} className="text-brand" />
        </div>
        <p className="font-display text-lg font-bold uppercase tracking-widest text-ink">
          Dashboard
        </p>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          Use the menu on the left to manage students, coaches, schedules,
          certificates and periods for your dojang.
        </p>
      </div>
    </div>
  );
}
