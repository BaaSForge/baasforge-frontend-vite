import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { RuntimeCard } from "@/components/runtime-card";
import { SectionTitle } from "@/components/section-title";

export default function ProjectRuntimesPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const projectIdNum = projectId != null ? Number(projectId) : undefined;
  const { data: runtimes, isLoading, error } = useProjectRuntimesQuery(projectIdNum);

  const liveRuntimes = runtimes?.filter(r => r.live_release_version != null) ?? [];
  const notLiveRuntimes = runtimes?.filter(r => r.live_release_version == null) ?? [];

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
            {liveRuntimes.length > 0 && (
              <>
                <SectionTitle>Online Runtimes</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  {liveRuntimes.map((runtime) => (
                    <RuntimeCard key={runtime.id} runtime={runtime} />
                  ))}
                </div>
              </>
            )}
            {notLiveRuntimes.length > 0 && (
              <>
                <SectionTitle>Offline Runtimes</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {notLiveRuntimes.map((runtime) => (
                    <RuntimeCard key={runtime.id} runtime={runtime} />
                  ))}
                </div>
              </>
            )}
            {(!liveRuntimes.length && !notLiveRuntimes.length) && (
              <div className="p-4 text-muted-foreground text-center text-sm">No runtimes found.</div>
            )}
          </>
        )}
      </Container>
    </>
  );
}