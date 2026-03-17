import { FancyButton } from "@/components/fancy-button";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
    SecondarySidebar,
    SecondarySidebarProvider,
    SidebarContent,
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
import { RuntimesModal } from "@/modules/project";
import { stopProjectChatSession } from "@/modules/project-chat/api";
import { useCreateProjectChatSessionMessageMutation, useCreateProjectChatSessionMutation } from "@/modules/project-chat/mutations";
import { useProjectChatSessionDetailQuery, useProjectChatSessionMessagesQuery } from "@/modules/project-chat/queries";
import {
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    ChatMessageType,
    ChatSessionRoleType,
    type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";
import { ConnectIcon, DisconnectIcon } from "@/modules/project/stores/runtime-store/exports";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarIcon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useParams } from "react-router";
import Controls from "./components/controls";
import { Message } from "./components/message";
import { MIDDLE_CONTENT_CLASSNAME } from "./constants";
import { applyStatusToMessageIdsInPages, useCaptureDocumentScroll, useSubscribeSession } from "./hooks";
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
    const [shouldShowResponsePlaceholder, setShouldShowResponsePlaceholder] = useState(false);
    const [runtimesModalOpen, setRuntimesModalOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const { setOpenSkipStorage, toggleSidebar, rereadSidebarOpen } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    const handleStopRef = useRef<(() => void) | null>(null);
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
    useEffect(() => {
        const onStopGeneration = () => handleStopRef.current?.();
        register(UNIFIED_KEYBOARD_SCOPES.STOP_GENERATION, onStopGeneration);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.STOP_GENERATION);
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
        } else {
            queueMicrotask(() => setShouldShowResponsePlaceholder(false));
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

    useSubscribeSession(projectIdOrUndefined, chatSessionIdOrUndefined);

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

        createSessionMutation.mutate(undefined, {
            onSuccess: (session) => {
                if (!session) return;

                createMessageMutation.mutate({
                    projectId: projectId ?? "",
                    chatSessionId: session.id,
                    optimisticMessage: {
                        ...optimisticMessage,
                        delivery_status: ChatMessageDeliveryStatus.Pending,
                    },
                });

                navigate(`/dashboard/projects/${projectId}/conversations/${session.id}`);

                setShouldShowResponsePlaceholder(true);
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
            createMessageMutation.mutate({
                projectId: projectId ?? "",
                chatSessionId: chatSessionIdOrUndefined ?? "",
                optimisticMessage,
            });

            flushSync(() => {
                setShouldShowResponsePlaceholder(true);
            });

            // Defer scroll so the mutation's optimistic re-render can run and layout settle; then scroll instantly so nothing interrupts.
            const el = responsePlaceholderRef.current;
            if (el) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        smoothScrollToElementTop(el);
                    });
                });
            }
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

    const lastMessage = chatSessionMessages?.[chatSessionMessages.length - 1];
    const isLastMessageFromAI = lastMessage?.role === ChatSessionRoleType.Ai;

    const lastUserMessageIndex = useMemo(() => findLastUserMessageIndex(chatSessionMessages), [chatSessionMessages]);
    const lastAiMessages: ChatMessageWithDeliveryStatus[] =
        lastUserMessageIndex >= 0 && chatSessionMessages ? chatSessionMessages.slice(lastUserMessageIndex + 1) : [];
    const isGenerating = lastAiMessages.some((m: ChatMessageWithDeliveryStatus) => m.status === ChatMessageStatus.Generating);

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

    useLayoutEffect(() => {
        handleStopRef.current = handleStop;
        return () => {
            handleStopRef.current = null;
        };
    }, [handleStop]);

    return (
        <>
            <PageTitleBox
                title={title}
                mainSidebar={mainSidebar}
                tools={
                    <>
                        {chatSession && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {chatSession.stage_project_runtime_id ? (
                                        <FancyButton size="sm" className="mr-2" color="green" onClick={() => setRuntimesModalOpen(true)}>
                                            <ConnectIcon className="size-4" />
                                            Connected
                                        </FancyButton>
                                    ) : (
                                        <Button variant="secondary" size="sm" className="mr-2" onClick={() => setRuntimesModalOpen(true)}>
                                            <DisconnectIcon className="size-4" />
                                            Disconnected
                                        </Button>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="bottom">See runtimes operations</TooltipContent>
                            </Tooltip>
                        )}
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
            <SecondarySidebar>
                <SidebarContent>
                    <SecondarySideBar />
                </SidebarContent>
            </SecondarySidebar>
            <SidebarInset>
                <Container>
                    {hasPreviousPage && <div ref={loadMoreRef} className="h-px w-full shrink-0" aria-hidden />}
                    <div className={cn("flex flex-col gap-0 min-h-0 min-w-0 flex-1 pb-4 overflow-x-hidden", MIDDLE_CONTENT_CLASSNAME)}>
                        {chatSessionMessages?.map((message) => (
                            <Message key={message.id} message={message} onRetry={handleRetryMessage} />
                        ))}
                        {shouldShowTemporaryMessageBeforeRedirecting && (
                            <Message
                                message={temporaryMessageBeforeRedirectingToNewSession}
                                onRetry={handleRetryTemporaryMessageBeforeRedirectingToNewSession}
                            />
                        )}
                        {shouldShowResponsePlaceholder && (
                            <div ref={responsePlaceholderRef} className="h-[60vh] w-full shrink-0 relative">
                                {!isLastMessageFromAI && <Spinner className="size-5 absolute top-0 left-0 text-blue-500" />}
                            </div>
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
            {chatSession && (
                <RuntimesModal
                    open={runtimesModalOpen}
                    onOpenChange={setRuntimesModalOpen}
                    projectId={projectId ?? ""}
                    chatSessionId={chatSession.id}
                    alreadyConnectedRuntimeId={chatSession.stage_project_runtime_id}
                />
            )}
        </>
    );
}
