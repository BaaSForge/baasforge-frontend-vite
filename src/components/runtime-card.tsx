import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { cn } from "@/lib/utils";
import { LiveBadge } from "./live-badge";
import { PlatformEnvironmentBadge } from "./platform-environment-badge";
import { DeploymentStatusBadge } from "./deployment-status-badge";
import type { ChatSessionResponse } from "@/modules/project-chat";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useRuntimeChatSessionActions } from "@/modules/project";
import { DisconnectIcon } from "@/modules/project/stores/runtime-store";

export interface RuntimeCardProps {
  runtime: ProjectRuntimeResponse;
  connectedChatSession?: ChatSessionResponse | null;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className="flex-1 min-w-0 border-b border-dashed border-muted-foreground/40"
        aria-hidden
      />
      {value}
    </div>
  );
}

export function RuntimeCard({ runtime, connectedChatSession }: RuntimeCardProps) {
  const { detachRuntime } = useRuntimeChatSessionActions();

  const handleDisconnect = () => {
    if (connectedChatSession) {
      detachRuntime({
        projectId: runtime.project_id,
        chatSessionId: connectedChatSession.id,
        projectRuntimeId: runtime.id,
      });
    }
  };

  const liveBadge = (
    <LiveBadge
      isOn={runtime.live_release_version != null}
      onLabel={`${runtime.live_release_version} is live`}
      offLabel="Not live"
      className="text-sm"
      size={0.5}
    />
  );

  const isStage = runtime.environment === "stage";
  
  return (
    <Card className={`p-0 gap-0 overflow-hidden shadow-none rounded-md`}>
      <CardHeader
        className={cn(
          "flex flex-row items-center border-b bg-muted justify-between gap-3 !py-2.5 px-3",
        )}
      >
        <h3 className="font-semibold text-sm truncate">{runtime.name}</h3>
        {isStage && (
          <div className="flex items-center gap-1.5 shrink-0">
            {connectedChatSession && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="xs" asChild>
                      <Link to={`/dashboard/projects/${runtime.project_id}/conversations/${connectedChatSession.id}`}>
                        <MessageSquare className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Go to the connected chat session.
                  </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={400}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={handleDisconnect}
                    >
                      <DisconnectIcon className="size-4" />
                      Disconnect
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Disconnect the chat session from this runtime
                    <br />
                    Then the runtime will be free to be used by another chat session to test new releases.
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="py-4 px-4 space-y-3">
        <InfoRow
          label="Live release version"
          value={liveBadge}
        />
        <InfoRow
          label="Environment"
          value={<PlatformEnvironmentBadge environment={runtime.environment} />}
        />
        <InfoRow
          label="Server Status"
          value={<DeploymentStatusBadge status={runtime.server_cluster_deployment_status} />}
        />
        <InfoRow
          label="Database Status"
          value={<DeploymentStatusBadge status={runtime.db_cluster_deployment_status} />}
        />
      </CardContent>
    </Card>
  );
}
