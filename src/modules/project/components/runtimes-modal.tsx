"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionTitle } from "@/components/section-title";
import { useProjectRuntimesWithConnectedChatQuery } from "../queries";
import { useRuntimeChatSessionActions } from "../stores/runtime-store";
import { PlatformEnvironmentType, type ProjectRuntimeWithConnectedChatResponse } from "../types";
import type { LucideIcon } from "lucide-react";
import { Link2, Unplug } from "lucide-react";

export interface RuntimesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  chatSessionId: number;
  alreadyConnectedRuntimeId?: number | null;
}

function RuntimeRow({
  runtime,
  actions = [],
}: {
  runtime: ProjectRuntimeWithConnectedChatResponse;
  actions?: {
    icon?: LucideIcon;
    onAction?: () => void;
    tooltip?: string;
    variant?: ButtonProps["variant"];
  }[],
}) {
  return (
    <Item variant="outline" size="sm" className="rounded-md">
      <ItemHeader>
        <ItemContent>
          <ItemTitle className="truncate min-w-0">{runtime.name}</ItemTitle>
        </ItemContent>
        {actions.length > 0 && (
          <ItemActions>
            {actions.map((action) => (
              <Tooltip key={action.tooltip}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant}
                    size="icon-xs"
                    onClick={action.onAction}
                    aria-label={action.tooltip}
                  >
                    {action.icon && <action.icon className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{action.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </ItemActions>
        )}
      </ItemHeader>
    </Item>
  );
}

export function RuntimesModal({
  open,
  onOpenChange,
  projectId,
  chatSessionId,
  alreadyConnectedRuntimeId,
}: RuntimesModalProps) {
  const { data: runtimes = [], isLoading, error } =
    useProjectRuntimesWithConnectedChatQuery(projectId);
  const { detachRuntime, attachRuntime } = useRuntimeChatSessionActions();

  const prodRuntimes = runtimes.filter(
    (r) => r.environment === PlatformEnvironmentType.prod,
  )
  const stageRuntimes = runtimes.filter(
    (r) => r.environment === PlatformEnvironmentType.stage,
  )

  const currentConnectedRuntime = stageRuntimes.find((r) => r.id === alreadyConnectedRuntimeId);

  const offlineRuntimes =
    stageRuntimes?.filter(
      (r) =>
        r.id !== currentConnectedRuntime?.id &&
        r.connected_chat_session == null
    );

  const onlineRuntimes =
    stageRuntimes?.filter(
      (r) =>
        r.id !== currentConnectedRuntime?.id &&
        r.connected_chat_session != null
    );

  const handleDetach = (runtime: ProjectRuntimeWithConnectedChatResponse) => {
    detachRuntime({
      projectId,
      chatSessionId: runtime.connected_chat_session?.id!,
      projectRuntimeId: runtime.id,
    });
  };

  const handleAttach = (runtime: ProjectRuntimeWithConnectedChatResponse) => {
    if (!chatSessionId) return;

    attachRuntime({
      projectId,
      chatSessionId,
      alreadyConnectedRuntimeId: alreadyConnectedRuntimeId,
      projectRuntimeId: runtime.id,
      alreadyConnectedChatSessionId: runtime.connected_chat_session?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Runtimes</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-6 text-muted-foreground text-center text-sm">
            Loading runtimes…
          </div>
        ) : error ? (
          <div className="py-6 text-destructive text-center text-sm">
            Failed to load runtimes.
          </div>
        ) : (
          <div className="space-y-6">
            {currentConnectedRuntime && (
              <>
                <SectionTitle>Current connected runtime</SectionTitle>
                <ItemGroup className="gap-2">
                  <RuntimeRow
                    runtime={currentConnectedRuntime}
                    actions={[{
                      icon: Link2,
                      variant: "destructive",
                      onAction: () => handleDetach(currentConnectedRuntime),
                      tooltip: "Disconnect chat session from this runtime",
                    }]}
                  />
                </ItemGroup>
              </>
            )}

            {offlineRuntimes.length > 0 && (
              <>
                <SectionTitle>Idle runtimes</SectionTitle>
                <ItemGroup className="gap-2">
                  {offlineRuntimes.map((runtime) => (
                    <RuntimeRow
                      key={runtime.id}
                      runtime={runtime}
                      actions={chatSessionId ? [{
                        icon: Unplug,
                        variant: "secondary",
                        onAction: () => handleAttach(runtime),
                        tooltip: "Connect chat session to this runtime",
                      }] : undefined}
                    />
                  ))}
                </ItemGroup>
              </>
            )}

            {onlineRuntimes.length > 0 && (
              <>
                <SectionTitle>Busy runtimes</SectionTitle>
                <ItemGroup className="gap-2">
                  {onlineRuntimes.map((runtime) => (
                    <RuntimeRow
                      key={runtime.id}
                      runtime={runtime}
                      actions={[
                        {
                          icon: Link2,
                          variant: "destructive",
                          onAction: () => handleDetach(runtime),
                          tooltip: "Disconnect to make this runtime free",
                        },
                        ...(chatSessionId ? [{
                          icon: Unplug,
                          variant: "destructive" as const,
                          onAction: () => handleAttach(runtime),
                          tooltip: "Disconnect, then connect",
                        }] : []),
                      ]}
                    />
                  ))}
                </ItemGroup>
              </>
            )}

          {prodRuntimes.length > 0 && (
              <>
                <SectionTitle>Production runtimes</SectionTitle>
                <ItemGroup className="gap-2">
                  {prodRuntimes.map((runtime) => (
                    <RuntimeRow
                      key={runtime.id}
                      runtime={runtime}
                    />
                  ))}
                </ItemGroup>
              </>
            )}

            {!currentConnectedRuntime &&
              offlineRuntimes.length === 0 &&
              onlineRuntimes.length === 0 &&
              prodRuntimes.length === 0 && (
                <div className="py-4 text-muted-foreground text-center text-sm">
                  No runtimes found.
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
