import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { RuntimeCard } from "@/components/runtime-card";
import { SectionTitle } from "@/components/section-title";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { useMemo } from "react";
import { useParams } from "react-router";

export default function ProjectRuntimesPage() {
    const { projectId } = useParams<{
        projectId: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;
    const { data: runtimes, isLoading, error } = useProjectRuntimesQuery(projectIdOrUndefined);

    const { busyRuntimes, idleRuntimes } = useMemo(() => {
        const list = runtimes ?? [];
        return {
            busyRuntimes: list.filter((r) => r.live_release != null),
            idleRuntimes: list.filter((r) => r.live_release == null),
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
                        {busyRuntimes.length > 0 && (
                            <>
                                <SectionTitle>Busy runtimes</SectionTitle>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                                    {busyRuntimes.map((runtime) => (
                                        <RuntimeCard key={runtime.id} runtime={runtime} />
                                    ))}
                                </div>
                            </>
                        )}
                        {idleRuntimes.length > 0 && (
                            <>
                                <SectionTitle>Idle runtimes</SectionTitle>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {idleRuntimes.map((runtime) => (
                                        <RuntimeCard key={runtime.id} runtime={runtime} />
                                    ))}
                                </div>
                            </>
                        )}
                        {busyRuntimes.length === 0 && idleRuntimes.length === 0 && (
                            <div className="p-4 text-muted-foreground text-center text-sm">No runtimes found.</div>
                        )}
                    </>
                )}
            </Container>
        </>
    );
}
