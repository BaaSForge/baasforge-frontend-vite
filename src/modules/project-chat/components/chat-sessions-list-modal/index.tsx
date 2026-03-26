"use client";

import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { Item, ItemGroup } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";
import { useProjectChatSessionsQuery } from "../../queries";
import type { ChatSessionResponse } from "../../types";
import { SessionLastMessageRow } from "./session-last-message-row";
import { SessionOwnershipChipsRow } from "./session-ownership-chips";
import { useChatSessionsModal, useChatSessionsModalState } from "./store";

function SessionItem({
    projectId,
    session,
    onNavigate,
    pathname,
}: {
    projectId: string;
    session: ChatSessionResponse;
    onNavigate: () => void;
    pathname: string;
}) {
    const url = `/dashboard/projects/${projectId}/conversations/${session.id}`;
    // Trailing slash avoids matching /conversations/10 when URL is /conversations/1 (same as sidebar).
    const isCurrentChat = `${pathname}/`.startsWith(`${url}/`);

    return (
        <Item size="sm" className="items-stretch rounded-none border-0 p-0 [&_a]:hover:bg-transparent">
            <Link
                to={url}
                onClick={onNavigate}
                aria-current={isCurrentChat ? "page" : undefined}
                className={cn(
                    "flex w-full min-w-0 flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-sm outline-none hover:bg-transparent",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    isCurrentChat
                        ? "border-solid border-blue-500/40 dark:border-blue-400/45"
                        : "border-dashed border-border",
                )}
            >
                <div className="flex w-full min-w-0 justify-end">
                    <div
                        className={cn(
                            "max-w-[80%] min-w-0 border-r border-border px-3 py-1.5 text-right text-xs font-medium leading-snug text-foreground",
                            "line-clamp-2",
                        )}
                    >
                        {session.title || "Untitled"}
                    </div>
                </div>
                <SessionLastMessageRow lastMessage={session.last_message} />
                <SessionOwnershipChipsRow
                    projectId={projectId}
                    chatSessionId={session.id}
                    ownedReleases={session.owned_releases}
                    ownedUnits={session.owned_units}
                />
            </Link>
        </Item>
    );
}

export function ChatSessionsListModal() {
    const { pathname } = useLocation();
    const { isOpen, projectId } = useChatSessionsModalState();
    const [, close] = useChatSessionsModal();
    const { data: sessions = [], isLoading } = useProjectChatSessionsQuery(projectId, { enabled: isOpen });

    const handleOpenChange = (open: boolean) => {
        if (!open) close();
    };

    return (
        <CentricModal open={isOpen} onOpenChange={handleOpenChange}>
            <CentricModalContent className="sm:max-w-md">
                <CentricModalHeader>
                    <CentricModalTitle>Chat sessions</CentricModalTitle>
                </CentricModalHeader>
                {isLoading ? (
                    <div className="text-muted-foreground flex items-center justify-center py-8 text-center text-sm">Loading…</div>
                ) : sessions.length === 0 ? (
                    <div className="text-muted-foreground flex items-center justify-center py-8 text-center text-sm">No chat sessions yet.</div>
                ) : projectId != null ? (
                    <ItemGroup className="gap-3">
                        {sessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                projectId={projectId}
                                session={session}
                                onNavigate={close}
                                pathname={pathname}
                            />
                        ))}
                    </ItemGroup>
                ) : null}
            </CentricModalContent>
        </CentricModal>
    );
}
