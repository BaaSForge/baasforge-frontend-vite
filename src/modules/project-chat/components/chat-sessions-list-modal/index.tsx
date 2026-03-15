"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { useProjectChatSessionsQuery } from "../../queries";
import type { ChatSessionResponse } from "../../types";
import { useChatSessionsModal, useChatSessionsModalState } from "./store";

function SessionItem({ projectId, session, onNavigate }: { projectId: string; session: ChatSessionResponse; onNavigate: () => void }) {
    const url = `/dashboard/projects/${projectId}/conversations/${session.id}`;

    return (
        <Item asChild size="default" className="border border-border rounded-md">
            <Link to={url} onClick={onNavigate}>
                <ItemMedia variant="icon">
                    <MessageSquare className="size-4" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">{session.title || "Untitled"}</ItemTitle>
                </ItemContent>
            </Link>
        </Item>
    );
}

export function ChatSessionsListModal() {
    const { isOpen, projectId } = useChatSessionsModalState();
    const [, close] = useChatSessionsModal();
    const { data: sessions = [], isLoading } = useProjectChatSessionsQuery(projectId ?? "");

    const handleOpenChange = (open: boolean) => {
        if (!open) close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Chat sessions</DialogTitle>
                </DialogHeader>
                <FadedScrollArea>
                    {isLoading ? (
                        <div className="text-muted-foreground flex items-center justify-center px-4 py-8 text-center text-sm">Loading…</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-muted-foreground flex items-center justify-center px-4 py-8 text-center text-sm">No chat sessions yet.</div>
                    ) : projectId != null ? (
                        <ItemGroup className="gap-2">
                            {sessions.map((session) => (
                                <SessionItem key={session.id} projectId={projectId} session={session} onNavigate={close} />
                            ))}
                        </ItemGroup>
                    ) : null}
                </FadedScrollArea>
            </DialogContent>
        </Dialog>
    );
}
