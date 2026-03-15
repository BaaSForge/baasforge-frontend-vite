import { FadedScrollArea } from "@/components/faded-scroll-area";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { UnitCardCompact, useProjectDraftUnitsQuery } from "@/modules/project";
import { Link, useParams } from "react-router";

export function SecondarySideBar() {
    const { projectId, conversationId } = useParams<{
        projectId: string;
        conversationId?: string;
    }>();

    const chatSessionId = conversationId ?? undefined;

    const { data: draftUnits, isLoading, error } = useProjectDraftUnitsQuery(projectId ?? undefined, chatSessionId);

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

            {(projectId == null || chatSessionId == null) && (
                <div className="p-2 text-sm text-muted-foreground">Start the conversation to generate draft units by using AI.</div>
            )}

            {isLoading && <div className="p-2 text-sm text-muted-foreground">Loading draft units…</div>}

            {error && <div className="p-2 text-sm text-destructive">Failed to load draft units.</div>}

            {(draftUnits == null || draftUnits.length === 0) && <div className="p-2 text-sm text-muted-foreground">No draft units in this conversation.</div>}

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
