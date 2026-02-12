import { useParams } from "react-router";
import { UnitCardCompact, useProjectDraftUnitsQuery } from "@/modules/project";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";

export function SecondarySideBar() {
  const { projectId, conversationId } = useParams<{
    projectId: string;
    conversationId?: string;
  }>();

  const projectIdNum = projectId != null ? Number(projectId) : undefined;
  const chatSessionId =
    conversationId != null ? Number(conversationId) : undefined;

  const { data: draftUnits, isLoading, error } = useProjectDraftUnitsQuery(
    projectIdNum,
    chatSessionId
  );

  if (projectIdNum == null || chatSessionId == null) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        Open a conversation to see draft units.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        Loading draft units…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-sm text-destructive">
        Failed to load draft units.
      </div>
    );
  }

  if (draftUnits == null || draftUnits.length === 0) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        No draft units in this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle className="mb-0">Draft units</SectionTitle>
        <Button variant="outline" size="xs">
          {/* TODO: add a modal to all units */}
          all units
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {draftUnits.map((unit) => (
          <UnitCardCompact key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}
