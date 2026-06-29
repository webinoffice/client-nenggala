// src/app/app/(authenticated)/student/score/submit/[studentId]/[programMsId]/[periodId]/page.tsx
import ScoreSubmitClient from "./ScoreSubmitClient";

export default async function ScoreSubmitPage({
  params,
}: {
  params: Promise<{ studentId: string; programMsId: string; periodId: string }>;
}) {
  const { studentId, programMsId, periodId } = await params;
  return (
    <ScoreSubmitClient
      studentId={Number(studentId)}
      programMsId={Number(programMsId)}
      periodId={Number(periodId)}
    />
  );
}
