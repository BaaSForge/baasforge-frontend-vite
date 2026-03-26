import {
    SecondarySidebarContent,
    SecondarySidebarStickyHeader,
} from "@/components/secondary-sidebar/secondary-sidebar-content";
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
        <SecondarySidebarContent
            header={
                <SecondarySidebarStickyHeader className="flex items-center justify-between gap-2 border-b border-sidebar-border pb-[calc(1rem+1px)]">
                    <SectionTitle className="mb-0">Draft units</SectionTitle>
                    <Button variant="outline" size="xs" asChild>
                        <Link to={`/dashboard/projects/${projectId}/units-releases`}>
                            {/* TODO: add a modal to all units */}
                            all units
                        </Link>
                    </Button>
                </SecondarySidebarStickyHeader>
            }
        >
            {projectId == null || chatSessionId == null ? (
                <div className="text-sm text-muted-foreground">Start the conversation to generate draft units by using AI.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading draft units…</div>
            ) : error ? (
                <div className="text-sm text-destructive">Failed to load draft units.</div>
            ) : draftUnits == null || draftUnits.length === 0 ? (
                <div className="text-sm text-muted-foreground">No draft units in this conversation.</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {draftUnits.map((unit) => (
                        <UnitCardCompact
                            className="mb-2"
                            key={unit.id}
                            projectId={projectId}
                            chatSessionId={chatSessionId}
                            unit={unit}
                        />
                    ))}
                </div>
            )}
        </SecondarySidebarContent>
    );
}
