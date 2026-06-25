"use client";

import { useMemo } from "react";
import CoachList from "./CoachList";
import { useCoaches, type MarketingCoach } from "@/lib/marketing/coaches";

type Coach = { id: string; name: string; rank: string; image: string };

function toCoach(c: MarketingCoach): Coach {
  return { id: c.id, name: c.name, rank: c.rank, image: c.image };
}

/**
 * Client wrapper for the about-page coach carousels. Sources coaches from the
 * public store and splits them into instructors and assistants (FgAssist). The
 * first of each group is the featured (center) card.
 */
export default function CoachSections() {
  const coaches = useCoaches();

  const { headCoach, otherCoaches, headAssistant, otherAssistants } = useMemo(() => {
    const instructors = coaches.filter((c) => !c.isAssistant).map(toCoach);
    const assistants = coaches.filter((c) => c.isAssistant).map(toCoach);
    return {
      headCoach: instructors[0] ?? null,
      otherCoaches: instructors.slice(1),
      headAssistant: assistants[0] ?? null,
      otherAssistants: assistants.slice(1),
    };
  }, [coaches]);

  return (
    <>
      {headCoach && (
        <CoachList title="The Coach" featured={headCoach} others={otherCoaches} />
      )}
      {headAssistant && (
        <CoachList
          title="The Assistant Coaches"
          featured={headAssistant}
          others={otherAssistants}
        />
      )}
    </>
  );
}
