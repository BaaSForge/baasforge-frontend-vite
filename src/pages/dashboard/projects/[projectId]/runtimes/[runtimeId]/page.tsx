import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { RuntimeCard } from "@/components/runtime-card";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { ServerIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";

export default function ProjectRuntimePage() {
    const { projectId, runtimeId } = useParams<{
        projectId: string;
        runtimeId: string;
    }>();
    const projectIdOrUndefined = projectId ?? undefined;
    const projectIdForLinks = projectId ?? "";

    const { data: runtimes, isLoading, error } = useProjectRuntimesQuery(projectIdOrUndefined);

    const runtime = useMemo(
        () => runtimes?.find((r) => r.id === runtimeId) ?? null,
        [runtimes, runtimeId],
    );

    const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();
    useEffect(() => {
        if (runtimeId == null) {
            clearSegmentLabel("runtimeId");
            return;
        }
        if (runtime?.name != null) {
            setSegmentLabel("runtimeId", runtime.name);
        }
        return () => clearSegmentLabel("runtimeId");
    }, [runtimeId, runtime?.name, setSegmentLabel, clearSegmentLabel]);

    if (projectIdOrUndefined == null || runtimeId == null) {
        return null;
    }

    return (
        <>
            <PageTitleBox title={runtime?.name ?? "Runtime"} />
            <Container>
                {isLoading ? (
                    <ContentLoadingState label="Loading runtime…" />
                ) : error ? (
                    <ContentErrorState
                        title="Failed to load runtime"
                        subtitle="Try refreshing the page and try again."
                    />
                ) : runtime == null ? (
                    <ContentEmptyState
                        title="Runtime not found"
                        description="This runtime is not part of the project or the link is invalid."
                        icon={ServerIcon}
                    />
                ) : (
                    <div className="max-w-xl">
                        <RuntimeCard projectId={projectIdForLinks} runtime={runtime} />
                    </div>
                )}
            </Container>
        </>
    );
}
