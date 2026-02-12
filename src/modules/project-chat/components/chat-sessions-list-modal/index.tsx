"use client";

import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectChatSessionsQuery } from "../../queries";
import {
  useChatSessionsModal,
  useChatSessionsModalState,
} from "./store";
import type { ChatSessionResponse } from "../../types";

function SessionItem({
  projectId,
  session,
  onNavigate,
}: {
  projectId: number;
  session: ChatSessionResponse;
  onNavigate: () => void;
}) {
  const url = `/dashboard/projects/${projectId}/conversations/${session.id}`;

  return (
    <Link
      to={url}
      onClick={onNavigate}
      className="hover:bg-muted focus:bg-muted block rounded-md px-3 py-2 text-sm transition-colors focus:outline-none"
    >
      <span className="line-clamp-1">{session.title || "Untitled"}</span>
    </Link>
  );
}

export function ChatSessionsListModal() {
  const { isOpen, projectId } = useChatSessionsModalState();
  const [, close] = useChatSessionsModal();
  const { data: sessions = [], isLoading } = useProjectChatSessionsQuery(
    projectId ?? 0,
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat sessions</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-md border">
          {isLoading ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              No chat sessions yet.
            </div>
          ) : (
            <ul className="divide-y p-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  {projectId != null && (
                    <SessionItem
                      projectId={projectId}
                      session={session}
                      onNavigate={close}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
