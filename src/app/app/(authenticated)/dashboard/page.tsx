// src/app/app/(authenticated)/dashboard/DashboardRouter.tsx
"use client";

import { useRole } from "@/lib/role-context";
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

  return <AdminDashboard />;
}
