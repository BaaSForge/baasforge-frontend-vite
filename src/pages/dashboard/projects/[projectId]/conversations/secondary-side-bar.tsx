import { Link, useParams } from "react-router";
import { UnitCardCompact, useProjectDraftUnitsQuery } from "@/modules/project";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { FadedScrollArea } from "@/components/faded-scroll-area";

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

  return (
    <div className="flex flex-col gap-2 p-2 mt-1.5">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle className="mb-0">Draft units</SectionTitle>
        <Button variant="outline" size="xs" asChild>
          <Link to={`/dashboard/projects/${projectId}/units-releases`}>
            {/* TODO: add a modal to all units */}
            all units
          </Link>
        </Button>
      </div>

      {projectIdNum == null || chatSessionId == null && (
        <div className="p-2 text-sm text-muted-foreground">
          Start the conversation to generate draft units by using AI.
        </div>
      )}

      {isLoading && (
        <div className="p-2 text-sm text-muted-foreground">
          Loading draft units…
        </div>
      )}

      {error && (
        <div className="p-2 text-sm text-destructive">
          Failed to load draft units.
        </div>
      )}

      {(draftUnits == null || draftUnits.length === 0) && (
        <div className="p-2 text-sm text-muted-foreground">
          No draft units in this conversation.
        </div>
      )}

      {draftUnits && draftUnits.length > 0 && (
        <FadedScrollArea className="flex flex-col gap-2 max-h-none h-full">
          {draftUnits.map((unit) => (
            <UnitCardCompact className="mb-2" key={unit.id} unit={unit} />
          ))}
        </FadedScrollArea>
      )}
    </div>
  );
}
