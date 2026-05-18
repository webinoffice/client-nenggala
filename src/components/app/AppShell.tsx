// src/components/app/AppShell.tsx
import type { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-paper-soft overflow-hidden">
      <Breadcrumb />
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
