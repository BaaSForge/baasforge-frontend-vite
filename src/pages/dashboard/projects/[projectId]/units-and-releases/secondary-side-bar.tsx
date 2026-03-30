import {
    SecondarySidebarContent,
    SecondarySidebarStickyHeader,
} from "@/components/secondary-sidebar/secondary-sidebar-content";
import { SectionTitle } from "@/components/section-title";
import { Separator } from "@/components/ui/separator";
import { ReleaseCardCompact } from "@/modules/project/components/release-card-compact";
import { useProjectReleasesQuery, useProjectRuntimesQuery } from "@/modules/project/queries";
import React from "react";
import { useNavigate, useParams } from "react-router";

export function SecondarySideBar() {
    const navigate = useNavigate();
    const { projectId, releaseRevision } = useParams<{
        projectId: string;
        releaseRevision: string;
    }>();

    const projectIdOrUndefined = projectId ?? undefined;

    const { data: releases, isLoading, error } = useProjectReleasesQuery(projectIdOrUndefined);
    const { data: runtimes, isLoading: isRuntimesLoading, error: isRuntimesError } = useProjectRuntimesQuery(projectIdOrUndefined);

    if (projectIdOrUndefined == null) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">No project selected.</div>
            </SecondarySidebarContent>
        );
    }

    if (isLoading || isRuntimesLoading) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">Loading releases or runtimes…</div>
            </SecondarySidebarContent>
        );
    }

    if (error || isRuntimesError) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-destructive">Failed to load releases or runtimes.</div>
            </SecondarySidebarContent>
        );
    }

    if (releases == null || releases.length === 0 || runtimes == null || runtimes.length === 0) {
        return (
            <SecondarySidebarContent>
                <div className="text-sm text-muted-foreground">No releases yet.</div>
            </SecondarySidebarContent>
        );
    }

    return (
        <SecondarySidebarContent
            header={
                <SecondarySidebarStickyHeader>
                    <SectionTitle className="mb-0">Choose release to view units</SectionTitle>
                </SecondarySidebarStickyHeader>
            }
        >
            <div className="flex flex-col gap-2">
                {releases.map((release, index) => (
                    <React.Fragment key={release.id}>
                        {index > 0 && (
                            <div className="flex h-4 shrink-0 justify-center">
                                <Separator orientation="vertical" />
                            </div>
                        )}
                        <ReleaseCardCompact
                            release={release}
                            selected={
                                releaseRevision != null &&
                                release.revision === Number.parseFloat(releaseRevision)
                            }
                            runtime={runtimes.find((rt) => rt.liveRelease?.id === release.id)}
                            onClick={() => {
                                navigate(`/dashboard/projects/${projectId}/units-releases/${release.revision}`);
                            }}
                            className="cursor-pointer"
                        />
                    </React.Fragment>
                ))}
            </div>
        </SecondarySidebarContent>
    );
}
