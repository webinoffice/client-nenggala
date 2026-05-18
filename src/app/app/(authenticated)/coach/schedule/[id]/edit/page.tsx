// src/app/app/(authenticated)/coach/schedule/[id]/edit/page.tsx
import ScheduleFormClient from "../../ScheduleFormClient";
export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScheduleFormClient mode="edit" id={id} />;
}
