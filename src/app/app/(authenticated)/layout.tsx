// src/app/app/(authenticated)/layout.tsx
import AuthGate from "@/components/app/AuthGate";
import AppShell from "@/components/app/AppShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
