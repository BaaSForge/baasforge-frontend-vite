import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
    NestedMainSidebarProvider,
    SecondarySidebar,
    SecondarySidebarProvider,
    SidebarInset,
    useRegisterSecondarySidebarShortcut,
    useSecondarySidebar,
    useSidebar,
} from "@/components/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QueryKeys } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { scrollToBottom, scrollToTop, smoothScrollToElementTop } from "@/lib/dom";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import { register, SHORTCUT_LABELS, UNIFIED_KEYBOARD_SCOPES, unregister } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";
import { stopProjectChatSession } from "@/modules/project-chat/api";
import { addSessionToGeneratingSet } from "@/modules/project-chat/ws-cache-handler";
import { useCreateProjectChatSessionMessageMutation, useCreateProjectChatSessionMutation } from "@/modules/project-chat/mutations";
import { useIsSessionGenerating, useProjectChatSessionDetailQuery, useProjectChatSessionMessagesQuery } from "@/modules/project-chat/queries";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatMessageType,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
} from "@/modules/project-chat/types";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarIcon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Controls from "./components/controls";
import { Message, MessageBranch, partitionMessagesByInvokingParent } from "./components/message";
import { StickyMessageBars, StickyMessageGroupsProvider } from "./components/sticky-messages";
import { MIDDLE_CONTENT_CLASSNAME } from "./constants";
import { applyStatusToMessageIdsInPages, useCaptureDocumentScroll } from "./hooks";
import { SecondarySideBar } from "./secondary-side-bar";
import { findLastUserMessageIndex } from "./utils";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectConversationsPage() {
    const mainSidebar = useSidebar();

    return (
        <SecondarySidebarProvider storageKey={STORAGE_KEYS.CONVERSATION_SIDEBAR_COLLAPSED} defaultOpen>
            <ProjectConversationsContent mainSidebar={mainSidebar} />
        </SecondarySidebarProvider>
    );
}

type ProjectConversationsContentProps = {
    mainSidebar: Sidebar;
};

function ProjectConversationsContent({ mainSidebar }: ProjectConversationsContentProps) {
    const queryClient = useQueryClient();
    const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
    const justRedirectedToNewSessionRef = useRef(false);
    const [temporaryMessageBeforeRedirectingToNewSession, setTemporaryMessageBeforeRedirectingToNewSession] = useState<
        ChatMessageWithDeliveryStatus | undefined
    >();
    const [messageInput, setMessageInput] = useState("");
    const { setOpenSkipStorage, toggleSidebar, rereadSidebarOpen } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    useEffect(() => {
        const onFocusChat = () => messageInputRef.current?.focus();
        const onFallbackKey = (key: string) => {
            messageInputRef.current?.focus();
            setMessageInput((prev) => prev + key);
        };
        register(UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT, onFocusChat);
        register(UNIFIED_KEYBOARD_SCOPES.FALLBACK_KEY, onFallbackKey);
        return () => {
            unregister(UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT);
            unregister(UNIFIED_KEYBOARD_SCOPES.FALLBACK_KEY);
        };
    }, []);
    const { conversationId, projectId } = useParams<{
        conversationId?: string;
        projectId: string;
    }>();

    const title = conversationId ? "Conversation" : "New conversation";

    const noConversation = conversationId == null;

    useEffect(() => {
        if (noConversation) {
            setOpenSkipStorage?.(false);
        } else {
            rereadSidebarOpen?.();
        }
    }, [noConversation, rereadSidebarOpen, setOpenSkipStorage]);

    const navigate = useNavigate();
    const projectIdOrUndefined = projectId ?? undefined;
    const chatSessionIdOrUndefined = conversationId ?? undefined;

    useEffect(() => {
        queueMicrotask(() => setTemporaryMessageBeforeRedirectingToNewSession(undefined));

        if (justRedirectedToNewSessionRef.current) {
            justRedirectedToNewSessionRef.current = false;
        }
    }, [chatSessionIdOrUndefined]);

    useLayoutEffect(() => {
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [chatSessionIdOrUndefined]);

    const { data: chatSession } = useProjectChatSessionDetailQuery(projectIdOrUndefined, chatSessionIdOrUndefined);
    const { setSegmentLabel, clearSegmentLabel } = useBreadcrumbActions();

    useEffect(() => {
        if (conversationId == null) {
            clearSegmentLabel("conversationId");
            return;
        }
        if (chatSession?.title != null) {
            setSegmentLabel("conversationId", chatSession.title || "Conversation");
        }
        return () => clearSegmentLabel("conversationId");
    }, [conversationId, chatSession?.title, setSegmentLabel, clearSegmentLabel]);

    const {
        data: chatSessionMessagesData,
        isLoading: isLoadingChatSessionMessages,
        hasPreviousPage,
        isFetchingPreviousPage,
        fetchPreviousPage,
    } = useProjectChatSessionMessagesQuery(projectIdOrUndefined, chatSessionIdOrUndefined);

    const firstMessage = chatSessionMessagesData?.pages[0][0];
    const captureDocumentScroll = useCaptureDocumentScroll(firstMessage?.id);

    const chatSessionMessages = (chatSessionMessagesData?.pages ?? []).flatMap((page) => [...page]);
    const { rootMessages, childrenByParentId } = useMemo(
        () => partitionMessagesByInvokingParent(chatSessionMessages),
        [chatSessionMessages],
    );

    /** If every message has a resolvable parent (e.g. cyclic / bad invoking_message_id), partition yields no roots — fall back to a flat list. */
    const displayRootMessages =
        rootMessages.length > 0 || chatSessionMessages.length === 0 ? rootMessages : chatSessionMessages;
    const displayChildrenByParentId =
        rootMessages.length > 0 || chatSessionMessages.length === 0 ? childrenByParentId : new Map();

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el || !hasPreviousPage || isFetchingPreviousPage || !chatSessionIdOrUndefined) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchPreviousPage().then(captureDocumentScroll);
                }
            },
            { rootMargin: "80px", threshold: 0.01 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage, chatSessionIdOrUndefined, captureDocumentScroll]);

    const createSessionMutation = useCreateProjectChatSessionMutation(projectId ?? "");
    const createMessageMutation = useCreateProjectChatSessionMessageMutation();

    const responsePlaceholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoadingChatSessionMessages || !chatSessionIdOrUndefined) {
            scrollToTop();
        } else {
            scrollToBottom();
        }
    }, [isLoadingChatSessionMessages, chatSessionIdOrUndefined]);

    const isCreatingSession = createSessionMutation.isPending;
    const isSendingMessage = createMessageMutation.isPending;
    const canSendNewConversation = noConversation && messageInput.trim() !== "" && !isCreatingSession;
    const canSendExistingConversation = !!chatSession && !!chatSessionIdOrUndefined && messageInput.trim() !== "" && !isSendingMessage;
    const canSend = canSendNewConversation || canSendExistingConversation;

    const createSessionThenMessage = (optimisticMessage: ChatMessageWithDeliveryStatus) => {
        setTemporaryMessageBeforeRedirectingToNewSession({
            ...optimisticMessage,
            delivery_status: ChatMessageDeliveryStatus.Pending,
        });

        createSessionMutation.mutate((optimisticMessage.payload as TextMessagePayload)?.text as string, {
            onSuccess: (session) => {
                if (!session) return;

                createMessageMutation.mutate(
                    {
                        projectId: projectId ?? "",
                        chatSessionId: session.id,
                        optimisticMessage: {
                            ...optimisticMessage,
                            delivery_status: ChatMessageDeliveryStatus.Pending,
                        },
                    },
                    {
                        onSuccess: () => {
                            addSessionToGeneratingSet(queryClient, projectId ?? "", session.id);
                        },
                    },
                );

                navigate(`/dashboard/projects/${projectId}/conversations/${session.id}`);
                justRedirectedToNewSessionRef.current = true;
            },
            onError: () => {
                setTemporaryMessageBeforeRedirectingToNewSession({
                    ...optimisticMessage,
                    delivery_status: ChatMessageDeliveryStatus.Failed,
                });
            },
        });
    };

    const handleRetryTemporaryMessageBeforeRedirectingToNewSession = () => {
        createSessionThenMessage(temporaryMessageBeforeRedirectingToNewSession!);
    };

    const handleSend = () => {
        if (!canSend) return;

        const text = messageInput.trim();
        setMessageInput("");

        const optimisticMessage: ChatMessageWithDeliveryStatus = {
            id: `temp-${Date.now()}`,
            chat_session_id: chatSessionIdOrUndefined ?? "",
            role: ChatSessionRoleType.User,
            type: ChatMessageType.Text,
            payload: { text },
            created_at: new Date().toISOString(),
            delivery_status: ChatMessageDeliveryStatus.Pending,
            status: ChatMessageStatus.Completed,
            is_optimistic: true,
            is_first: false,
        };

        if (noConversation) {
            createSessionThenMessage(optimisticMessage);
        } else {
            createMessageMutation.mutate(
                {
                    projectId: projectId ?? "",
                    chatSessionId: chatSessionIdOrUndefined ?? "",
                    optimisticMessage,
                },
                {
                    onSuccess: () => {
                        addSessionToGeneratingSet(queryClient, projectId ?? "", chatSessionIdOrUndefined ?? "");
                        const el = responsePlaceholderRef.current;
                        if (el) {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => smoothScrollToElementTop(el));
                            });
                        }
                    },
                },
            );
        }
    };

    const handleRetryMessage = (message: ChatMessageWithDeliveryStatus) => {
        createMessageMutation.mutate({
            projectId: projectId ?? "",
            chatSessionId: chatSessionIdOrUndefined ?? "",
            optimisticMessage: message,
        });
    };

    const shouldShowTemporaryMessageBeforeRedirecting = temporaryMessageBeforeRedirectingToNewSession != null && !chatSessionIdOrUndefined;

    const lastUserMessageIndex = useMemo(() => findLastUserMessageIndex(chatSessionMessages), [chatSessionMessages]);
    const lastAiMessages: ChatMessageWithDeliveryStatus[] =
        lastUserMessageIndex >= 0 && chatSessionMessages ? chatSessionMessages.slice(lastUserMessageIndex + 1) : [];
    const isGeneratingFromWs = useIsSessionGenerating(projectIdOrUndefined, chatSessionIdOrUndefined);
    const isGeneratingFromMessages = lastAiMessages.some((m: ChatMessageWithDeliveryStatus) => m.status === ChatMessageStatus.Generating);
    const isGenerating = isGeneratingFromWs || isGeneratingFromMessages;

    const lastAiEndStatus = useMemo((): "failed" | "stopped" | null => {
        if (!lastAiMessages.length) return null;
        const hasFailed = lastAiMessages.some((m) => m.status === ChatMessageStatus.Failed);
        if (hasFailed) return "failed";
        const hasStopped = lastAiMessages.some((m) => m.status === ChatMessageStatus.Stopped);
        if (hasStopped) return "stopped";
        return null;
    }, [lastAiMessages]);

    const [placeholderVisible, setPlaceholderVisible] = useState(false);
    useEffect(() => {
        setPlaceholderVisible(false);
    }, [chatSessionIdOrUndefined]);
    useEffect(() => {
        if (isGenerating && chatSessionIdOrUndefined) setPlaceholderVisible(true);
    }, [isGenerating, chatSessionIdOrUndefined]);

    const prevIsGeneratingRef = useRef(isGenerating);

    useLayoutEffect(() => {
        const wasGenerating = prevIsGeneratingRef.current;
        prevIsGeneratingRef.current = isGenerating;
        if (wasGenerating && !isGenerating) {
            const el = messageInputRef.current;
            if (el) {
                requestAnimationFrame(() => el.focus());
            }
        }
    }, [isGenerating]);

    const handleStop = useCallback(() => {
        if (projectIdOrUndefined == null || chatSessionIdOrUndefined == null) return;
        stopProjectChatSession(projectId ?? "", chatSessionIdOrUndefined).then((res) => {
            if (res?.stopped_message_ids?.length) {
                const cacheKey = QueryKeys.projectChatSessionMessages(projectId ?? "", chatSessionIdOrUndefined);
                queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
                    modifyInfiniteCacheData(old, (pages) => applyStatusToMessageIdsInPages(pages, res.stopped_message_ids, ChatMessageStatus.Stopped)),
                );
            }
        });
    }, [projectIdOrUndefined, chatSessionIdOrUndefined, projectId, queryClient]);

    return (
        <NestedMainSidebarProvider mainSidebar={mainSidebar}>
            <StickyMessageGroupsProvider>
                <PageTitleBox
                    title={title}
                    mainSidebar={mainSidebar}
                    tools={
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="sm" onClick={toggleSidebar}>
                                        <SidebarIcon className="size-4 rotate-180" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Toggle draft units ({SHORTCUT_LABELS.SECONDARY_SIDEBAR})</TooltipContent>
                            </Tooltip>
                        </>
                    }
                >
                    {isFetchingPreviousPage && <Spinner className="size-8 absolute top-[100%] mt-2 left-1/2 -translate-x-1/2 text-blue-500" />}
                </PageTitleBox>
                <StickyMessageBars mainSidebar={mainSidebar} />
                <SecondarySidebar>
                    <SecondarySideBar />
                </SecondarySidebar>
                <SidebarInset>
                    <Container>
                        {hasPreviousPage && <div ref={loadMoreRef} className="h-px w-full shrink-0" aria-hidden />}
                        <div className={cn("flex flex-col gap-0 min-h-0 min-w-0 flex-1 pb-4 overflow-x-hidden", MIDDLE_CONTENT_CLASSNAME)}>
                            {displayRootMessages.map((message) => (
                                <MessageBranch
                                    key={message.id}
                                    message={message}
                                    childrenByParentId={displayChildrenByParentId}
                                    onRetry={handleRetryMessage}
                                />
                            ))}
                            {shouldShowTemporaryMessageBeforeRedirecting && (
                                <Message
                                    message={temporaryMessageBeforeRedirectingToNewSession}
                                    onRetry={handleRetryTemporaryMessageBeforeRedirectingToNewSession}
                                />
                            )}
                            {lastAiEndStatus != null && !isGenerating && (
                                <div
                                    className={cn(
                                        "py-1 text-sm",
                                        lastAiEndStatus === "failed" ? "text-destructive" : "text-muted-foreground",
                                    )}
                                >
                                    {lastAiEndStatus === "failed" ? "Generation failed." : "Generation stopped."}
                                </div>
                            )}
                            {(isGenerating || placeholderVisible) && (
                                <div ref={responsePlaceholderRef} className="h-[60vh] w-full shrink-0 relative" />
                            )}
                        </div>
                        <Controls
                            messageInputRef={messageInputRef}
                            messageInputValue={messageInput}
                            setMessageInputValue={setMessageInput}
                            handleSend={handleSend}
                            handleStop={handleStop}
                            canSend={canSend}
                            isGenerating={isGenerating}
                            isNewSession={noConversation && !shouldShowTemporaryMessageBeforeRedirecting}
                            mainSidebar={mainSidebar}
                        />
                    </Container>
                </SidebarInset>
            </StickyMessageGroupsProvider>
        </NestedMainSidebarProvider>
    );
}
