// src/app/app/(authenticated)/student/score/view/[studentId]/[programMsId]/[periodId]/page.tsx
import ScoreViewClient from "./ScoreViewClient";

export default async function ScoreViewPage({
  params,
}: {
  params: Promise<{ studentId: string; programMsId: string; periodId: string }>;
}) {
  const { studentId, programMsId, periodId } = await params;
  return (
    <ScoreViewClient
      studentId={Number(studentId)}
      programMsId={Number(programMsId)}
      periodId={Number(periodId)}
    />
  );
}
