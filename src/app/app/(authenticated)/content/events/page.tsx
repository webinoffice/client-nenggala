// src/app/app/(authenticated)/content/events/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import EventsClient from "./EventsClient";

export default function ContentEventsPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <EventsClient />
    </RoleGuard>
  );
}
