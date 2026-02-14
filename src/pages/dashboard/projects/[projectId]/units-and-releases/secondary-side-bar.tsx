import React from "react";
import { useNavigate, useParams } from "react-router";
import { SectionTitle } from "@/components/section-title";
import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProjectReleasesQuery, useProjectRuntimesWithConnectedChatQuery } from "@/modules/project/queries";
import { ReleaseCardCompact } from "@/modules/project/components/release-card-compact";

export function SecondarySideBar() {
  const navigate = useNavigate();
  const { projectId, releaseVersion } = useParams<{
    projectId: string;
    releaseVersion: string;
  }>();

  const projectIdNum = projectId != null ? Number(projectId) : undefined;

  const { data: releases, isLoading, error } = useProjectReleasesQuery(projectIdNum);
  const { data: runtimes, isLoading: isRuntimesLoading, error: isRuntimesError } = useProjectRuntimesWithConnectedChatQuery(projectIdNum);

  if (projectIdNum == null) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        No project selected.
      </div>
    );
  }

  if (isLoading || isRuntimesLoading) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        Loading releases or runtimes…
      </div>
    );
  }

  if (error || isRuntimesError) {
    return (
      <div className="p-2 text-sm text-destructive">
        Failed to load releases or runtimes.
      </div>
    );
  }

  if (releases == null || releases.length === 0 || runtimes == null || runtimes.length === 0) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        No releases yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 mt-1.5">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle className="mb-0">Choose release to view units</SectionTitle>
      </div>
      <FadedScrollArea className="flex flex-col gap-2 max-h-none h-full">
        {releases.map((release, index) => (
          <React.Fragment key={release.id}>
            {index > 0 && (
              <div className="flex justify-center h-4 shrink-0">
                <Separator orientation="vertical" />
              </div>
            )}
            <ReleaseCardCompact
              release={release}
              selected={release.version === releaseVersion}
              runtime={runtimes.find((runtime) => runtime.live_release_version === release.version)}
              onClick={() => {
                navigate(`/dashboard/projects/${projectId}/units-releases/${release.version}`);
              }}
              className="cursor-pointer"
            />
          </React.Fragment>
        ))}
      </FadedScrollArea>
    </div>
  );
}
