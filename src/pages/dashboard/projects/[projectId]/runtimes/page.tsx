import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { useProjectRuntimesWithConnectedChatQuery } from "@/modules/project/queries";
import { RuntimeCard } from "@/components/runtime-card";
import { SectionTitle } from "@/components/section-title";

export default function ProjectRuntimesPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const projectIdOrUndefined = projectId ?? undefined;
  const { data: runtimes, isLoading, error } = useProjectRuntimesWithConnectedChatQuery(projectIdOrUndefined);

  const busyRuntimes = runtimes?.filter(r => r.connected_chat_session != null) ?? [];
  const idleRuntimes = runtimes?.filter(r => r.connected_chat_session == null) ?? [];

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
                <SectionTitle>Busy Runtimes</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  {busyRuntimes.map((runtime) => (
                    <RuntimeCard key={runtime.id} runtime={runtime} connectedChatSession={runtime.connected_chat_session} />
                  ))}
                </div>
              </>
            )}
            {idleRuntimes.length > 0 && (
              <>
                <SectionTitle>Idle Runtimes</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {idleRuntimes.map((runtime) => (
                    <RuntimeCard key={runtime.id} runtime={runtime} connectedChatSession={runtime.connected_chat_session} />
                  ))}
                </div>
              </>
            )}
            {(!busyRuntimes.length && !idleRuntimes.length) && (
              <div className="p-4 text-muted-foreground text-center text-sm">No runtimes found.</div>
            )}
          </>
        )}
      </Container>
    </>
  );
}