import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { RuntimeCard } from "@/components/runtime-card";
import { SectionTitle } from "@/components/section-title";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType } from "@/modules/project/types";
import { events, triggerAppEvent } from "@/services/events";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";

export default function ProjectRuntimesPage() {
    const { projectId } = useParams<{
        projectId: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;
    const projectIdForLinks = projectId ?? "";
    const { data: runtimes, isLoading, error } = useProjectRuntimesQuery(projectIdOrUndefined);

    useEffect(() => {
        triggerAppEvent(events.RUNTIMES_PAGE_MOUNTED_EVENT);
    }, []);

    const { productionRuntimes, busyStageRuntimes, idleStageRuntimes } = useMemo(() => {
        const list = runtimes ?? [];
        const production = list.filter((r) => r.environment === PlatformEnvironmentType.prod);
        const stage = list.filter((r) => r.environment === PlatformEnvironmentType.stage);
        return {
            productionRuntimes: production,
            busyStageRuntimes: stage.filter((r) => r.live_release != null),
            idleStageRuntimes: stage.filter((r) => r.live_release == null),
        };
    }, [runtimes]);

    return (
        <>
            <PageTitleBox title="Runtimes" />
            <Container>
                {isLoading ? (
                    <div className="p-4 text-muted-foreground text-center text-sm">Loading runtimes…</div>
                ) : error ? (
                    <div className="p-4 text-destructive text-center text-sm">Failed to load runtimes.</div>
                ) : (
                    <>
                        {productionRuntimes.length > 0 && (
                            <>
                                <SectionTitle>Production runtimes</SectionTitle>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                                    {productionRuntimes.map((runtime) => (
                                        <RuntimeCard key={runtime.id} projectId={projectIdForLinks} runtime={runtime} />
                                    ))}
                                </div>
                            </>
                        )}
                        {busyStageRuntimes.length > 0 && (
                            <>
                                <SectionTitle>Busy stage runtimes</SectionTitle>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                                    {busyStageRuntimes.map((runtime) => (
                                        <RuntimeCard key={runtime.id} projectId={projectIdForLinks} runtime={runtime} />
                                    ))}
                                </div>
                            </>
                        )}
                        {idleStageRuntimes.length > 0 && (
                            <>
                                <SectionTitle>Idle stage runtimes</SectionTitle>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {idleStageRuntimes.map((runtime) => (
                                        <RuntimeCard key={runtime.id} projectId={projectIdForLinks} runtime={runtime} />
                                    ))}
                                </div>
                            </>
                        )}
                        {productionRuntimes.length === 0 &&
                            busyStageRuntimes.length === 0 &&
                            idleStageRuntimes.length === 0 && (
                            <div className="p-4 text-muted-foreground text-center text-sm">No runtimes found.</div>
                        )}
                    </>
                )}
            </Container>
        </>
    );
}
