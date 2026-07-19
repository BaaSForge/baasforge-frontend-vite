import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
    SecondarySidebar,
    SecondarySidebarProvider,
    SidebarInset,
    useRegisterSecondarySidebarShortcut,
    useSecondarySidebar,
} from "@/components/secondary-sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QueryKeys } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useBreadcrumbActions } from "@/stores/breadcrumb";
import { scrollToBottom, scrollToTop, smoothScrollToElementTop } from "@/lib/dom";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import { register, SHORTCUT_LABELS, UNIFIED_KEYBOARD_SCOPES, unregister } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";
import { events, listenAppEvent } from "@/services/events";
import {
    invalidateDueToRejectOrEdit,
    removeProjectDraftUnitsAsOfReleaseControllerQueries,
} from "@/modules/project/invalidate-project-queries";
import { postUserMessageTruncateBelow, stopProjectChatSession } from "@/modules/project-chat/api";
import { addSessionToGeneratingSet } from "@/modules/project-chat/ws-cache-handler";
import { createOptimisticUserTextMessage } from "@/modules/project-chat/optimistic-user-text-message";
import { useCreateProjectChatSessionMessageMutation, useCreateProjectChatSessionMutation, useRetryFailedPlannerMessageMutation } from "@/modules/project-chat/mutations";
import {
    collectReleaseControllerMessageIdsRemovedByTruncateBelow,
    trimInfiniteMessagesCacheRemovingMessageAndAfter,
} from "@/modules/project-chat/trim-messages-cache";
import { useIsSessionGenerating, useProjectChatSessionDetailQuery, useProjectChatSessionMessagesQuery } from "@/modules/project-chat/queries";
import {
    ChatAgentType,
    ChatMessageDeliveryStatus,
    ChatMessageStatus,
    type ChatComposerTraceReference,
    type ChatMessageWithDeliveryStatus,
    type TextMessagePayload,
} from "@/modules/project-chat/types";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarIcon } from "lucide-react";
import { toast } from "@/lib/toast";
import { buildInlineToken, stripInlineReleaseTokens, stripInlineTraceTokens } from "@/components/chat-rich-text-editor/composer-inline-format";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    ConversationDebugSessionProvider,
    getConversationDebugSendContext,
    releaseResponseFromConversationDebug,
    useConversationDebugSession,
} from "./conversation-debug";
import { useLocation, useNavigate, useParams } from "react-router";
import { ConversationSessionMessagesProvider } from "./components/conversation-session-messages-context";
import { ConversationStaleBaseReleaseProvider } from "./components/conversation-stale-base-release-context";
import { ConversationStaleBaseReleaseTitleBadge } from "./components/conversation-stale-base-release-title-badge";
import { buildComposerPrefillFromUserTextMessage, type ChatComposerPrefill } from "./chat-composer-prefill";
import type { ChatRichTextEditorHandle } from "@/components/chat-rich-text-editor";
import Controls from "./components/controls";
import { GenerationSessionEndBanner } from "./components/generation-session-end-banner";
import { Message, MessageBranch } from "./components/message";
import { LiveProductionTimelineProvider } from "./components/message/live-production-timeline-context";
import { partitionMessagesByInvokingParent } from "./components/message/partition-invoked-messages";
import { StickyMessageBars, StickyMessageGroupsProvider } from "./components/sticky-messages";
import { MIDDLE_CONTENT_CLASSNAME } from "./constants";
import { useFollowBottomOnNewMessages } from "./follow-bottom-scroll";
import { applyStatusToMessageIdsInPages, useCaptureDocumentScroll } from "./hooks";
import { SecondarySideBar } from "./secondary-side-bar";
import {
    chatComposerDraftStorageKey,
    readChatComposerDraft,
    writeChatComposerDraft,
} from "./chat-composer-draft-session-storage";
import { findLastUserMessageIndex } from "./utils";

function composeDebugReleaseDraft(prev: string, releaseToken: string): string {
    const body = stripInlineReleaseTokens(prev).trim();
    if (body === "") return `${releaseToken}\n\n`;
    return `${releaseToken}\n\n${body}`;
}

function composeDebugTraceDraft(prev: string, releaseToken: string, traceTokens: string[]): string {
    let body = stripInlineReleaseTokens(prev);
    body = stripInlineTraceTokens(body).trim();
    const head = [releaseToken, ...traceTokens].join("\n\n");
    if (body === "") return `${head}\n\n`;
    return `${head}\n\n${body}`;
}

export default function ProjectConversationsPage() {
    return (
        <SecondarySidebarProvider storageKey={STORAGE_KEYS.CONVERSATION_SIDEBAR_COLLAPSED} defaultOpen>
            <ConversationDebugSessionProvider>
                <ProjectConversationsContent />
            </ConversationDebugSessionProvider>
        </SecondarySidebarProvider>
    );
}

function ProjectConversationsContent() {
    const { search: locationSearch } = useLocation();
    const conversationDebug = useConversationDebugSession();
    const messageDebugContext = useMemo(() => getConversationDebugSendContext(conversationDebug), [conversationDebug]);
    const { debugFromSearch } = conversationDebug;

    const queryClient = useQueryClient();
    const messageInputRef = useRef<ChatRichTextEditorHandle | null>(null);
    const justRedirectedToNewSessionRef = useRef(false);
    const [temporaryMessageBeforeRedirectingToNewSession, setTemporaryMessageBeforeRedirectingToNewSession] = useState<
        ChatMessageWithDeliveryStatus | undefined
    >();
    const [messageInput, setMessageInput] = useState("");
    const { setOpenSkipStorage, toggleSidebar, rereadSidebarOpen } = useSecondarySidebar();
    useRegisterSecondarySidebarShortcut();
    useEffect(() => {
        const onFocusChat = () => messageInputRef.current?.focus();
        register(UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT, onFocusChat);
        return () => {
            unregister(UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT);
        };
    }, [messageInputRef]);
    const { conversationId, projectId } = useParams<{
        conversationId?: string;
        projectId: string;
    }>();

    const composerDraftStorageKey =
        projectId != null && projectId !== "" ? chatComposerDraftStorageKey(projectId, conversationId) : null;

    const skipComposerDraftPersistAfterHydrateRef = useRef(false);

    useLayoutEffect(() => {
        if (composerDraftStorageKey == null) return;
        skipComposerDraftPersistAfterHydrateRef.current = true;
        const stored = readChatComposerDraft(composerDraftStorageKey) ?? "";
        setMessageInput(stored);
    }, [composerDraftStorageKey]);

    useEffect(() => {
        if (composerDraftStorageKey == null) return;
        if (skipComposerDraftPersistAfterHydrateRef.current) {
            skipComposerDraftPersistAfterHydrateRef.current = false;
            return;
        }
        writeChatComposerDraft(composerDraftStorageKey, messageInput);
    }, [composerDraftStorageKey, messageInput]);

    /** With `?debug=` still in the URL: merge release/trace chips into the draft once (URL is then replaced in the provider). */
    useEffect(() => {
        if (!debugFromSearch || projectId == null || projectId === "") return;

        const release = releaseResponseFromConversationDebug(debugFromSearch, projectId);
        const releaseToken = buildInlineToken("release", JSON.stringify(release));
        const traceIdList = debugFromSearch.trace_ids ?? [];
        const traceTokens = traceIdList.map((id) => {
            const ref: ChatComposerTraceReference = { release, traceID: id.trim() };
            return buildInlineToken("trace", JSON.stringify(ref));
        });

        setMessageInput((prev) => {
            const next =
                traceTokens.length > 0
                    ? composeDebugTraceDraft(prev, releaseToken, traceTokens)
                    : composeDebugReleaseDraft(prev, releaseToken);
            return next === prev ? prev : next;
        });
    }, [debugFromSearch, projectId, conversationId]);

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
    }, [chatSessionIdOrUndefined, messageInputRef]);

    const { data: chatSession } = useProjectChatSessionDetailQuery(projectIdOrUndefined, chatSessionIdOrUndefined);
    const conversationStaleBaseRelease = chatSession?.stale_base_release === true;
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
    const retryFailedPlannerMutation = useRetryFailedPlannerMessageMutation();

    const plannerRetryPendingMessageId =
        retryFailedPlannerMutation.isPending && retryFailedPlannerMutation.variables
            ? retryFailedPlannerMutation.variables.messageId
            : null;

    const [branchTruncateDialog, setBranchTruncateDialog] = useState<{
        open: boolean;
        mode: "edit" | "revert";
        message: ChatMessageWithDeliveryStatus | null;
    }>({ open: false, mode: "edit", message: null });
    const [truncatingBranchMessageId, setTruncatingBranchMessageId] = useState<string | null>(null);

    const applyComposerPrefill = useCallback((prefill: ChatComposerPrefill) => {
        setMessageInput(prefill.text);
        if (prefill.extras) {
            // Merge attachment IDs, staged files, and other composer-only state when the main input supports them.
        }
    }, []);

    useEffect(() => {
        return listenAppEvent(events.CHAT_COMPOSER_FILL_PROMPT_EVENT, (event) => {
            applyComposerPrefill({ text: event.detail.text });
        });
    }, [applyComposerPrefill]);

    const runTruncateBelowMessage = useCallback(
        async (message: ChatMessageWithDeliveryStatus) => {
            if (projectId == null || chatSessionIdOrUndefined == null) return;
            await postUserMessageTruncateBelow(projectId, chatSessionIdOrUndefined, message.id);

            const messagesKey = QueryKeys.projectChatSessionMessages(projectId, chatSessionIdOrUndefined);
            const messagesBeforeTrim = queryClient.getQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(messagesKey);
            const removedReleaseControllerIds = collectReleaseControllerMessageIdsRemovedByTruncateBelow(
                messagesBeforeTrim,
                message.id,
            );
            removeProjectDraftUnitsAsOfReleaseControllerQueries(
                queryClient,
                projectId,
                chatSessionIdOrUndefined,
                removedReleaseControllerIds,
            );

            queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(
                messagesKey,
                (old) => trimInfiniteMessagesCacheRemovingMessageAndAfter(old, message.id) ?? old,
            );

            await invalidateDueToRejectOrEdit(queryClient, projectId, chatSessionIdOrUndefined);
        },
        [projectId, chatSessionIdOrUndefined, queryClient],
    );

    const handleConfirmBranchTruncate = useCallback(async () => {
        const msg = branchTruncateDialog.message;
        const mode = branchTruncateDialog.mode;
        if (!msg || projectId == null || chatSessionIdOrUndefined == null) return;

        setTruncatingBranchMessageId(msg.id);
        try {
            await runTruncateBelowMessage(msg);
            setBranchTruncateDialog({ open: false, mode: "edit", message: null });

            if (mode === "edit") {
                applyComposerPrefill(buildComposerPrefillFromUserTextMessage(msg));
                requestAnimationFrame(() => messageInputRef.current?.focus());
            } else {
                scrollToBottom();
                requestAnimationFrame(() => messageInputRef.current?.focus());
            }
        } catch {
            toast.error(mode === "edit" ? "Could not prepare edit." : "Could not revert to this point.");
        } finally {
            setTruncatingBranchMessageId(null);
        }
    }, [
        branchTruncateDialog.message,
        branchTruncateDialog.mode,
        projectId,
        chatSessionIdOrUndefined,
        runTruncateBelowMessage,
        applyComposerPrefill,
        messageInputRef,
    ]);

    const handleBranchTruncateDialogOpenChange = useCallback((open: boolean) => {
        if (!open && truncatingBranchMessageId == null) {
            setBranchTruncateDialog({ open: false, mode: "edit", message: null });
        }
    }, [truncatingBranchMessageId]);

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
                        debugContext: messageDebugContext,
                    },
                    {
                        onSuccess: () => {
                            addSessionToGeneratingSet(queryClient, projectId ?? "", session.id);
                        },
                    },
                );

                navigate({
                    pathname: `/dashboard/projects/${projectId}/conversations/${session.id}`,
                    search: locationSearch || undefined,
                });
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

        const optimisticMessage = createOptimisticUserTextMessage(chatSessionIdOrUndefined ?? "", text);

        if (noConversation) {
            createSessionThenMessage(optimisticMessage);
        } else {
            createMessageMutation.mutate(
                {
                    projectId: projectId ?? "",
                    chatSessionId: chatSessionIdOrUndefined ?? "",
                    optimisticMessage,
                    debugContext: messageDebugContext,
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
            debugContext: messageDebugContext,
        });
    };

    const handleRetryFailedPlannerMessage = (message: ChatMessageWithDeliveryStatus) => {
        if (projectId == null || projectId === "" || chatSessionIdOrUndefined == null) return;
        retryFailedPlannerMutation.mutate({
            projectId,
            chatSessionId: chatSessionIdOrUndefined,
            messageId: message.id,
        });
    };

    const shouldShowTemporaryMessageBeforeRedirecting = temporaryMessageBeforeRedirectingToNewSession != null && !chatSessionIdOrUndefined;

    const lastUserMessageIndex = useMemo(() => findLastUserMessageIndex(chatSessionMessages), [chatSessionMessages]);
    const lastAiMessages = useMemo((): ChatMessageWithDeliveryStatus[] => {
        if (lastUserMessageIndex >= 0 && chatSessionMessages) {
            return chatSessionMessages.slice(lastUserMessageIndex + 1);
        }
        return [];
    }, [lastUserMessageIndex, chatSessionMessages]);
    const isGeneratingFromWs = useIsSessionGenerating(projectIdOrUndefined, chatSessionIdOrUndefined);
    const isGeneratingFromMessages = lastAiMessages.some((m: ChatMessageWithDeliveryStatus) => m.status === ChatMessageStatus.Generating);
    const isAnyMessageGenerating = useMemo(
        () =>
            isGeneratingFromWs ||
            chatSessionMessages.some((m) => m.status === ChatMessageStatus.Generating),
        [isGeneratingFromWs, chatSessionMessages],
    );
    const isGenerating = isGeneratingFromWs || isGeneratingFromMessages;

    const lastAiEndStatus = useMemo((): "failed" | "stopped" | null => {
        const plannerMessages = lastAiMessages.filter((m) => m.agent === ChatAgentType.Planner);
        if (!plannerMessages.length) return null;
        const hasFailed = plannerMessages.some((m) => m.status === ChatMessageStatus.Failed);
        if (hasFailed) return "failed";
        const hasStopped = plannerMessages.some((m) => m.status === ChatMessageStatus.Stopped);
        if (hasStopped) return "stopped";
        return null;
    }, [lastAiMessages]);

    const [placeholderVisible, setPlaceholderVisible] = useState(false);
    useEffect(() => {
        queueMicrotask(() => {
            setPlaceholderVisible(false);
        });
    }, [chatSessionIdOrUndefined]);
    useEffect(() => {
        if (isGenerating && chatSessionIdOrUndefined) {
            queueMicrotask(() => {
                setPlaceholderVisible(true);
            });
        }
    }, [isGenerating, chatSessionIdOrUndefined]);

    const { pinnedToBottom: followScrollPinned, jumpToBottom: jumpFollowScrollToBottom } = useFollowBottomOnNewMessages({
        conversationId: chatSessionIdOrUndefined,
        isLoadingMessages: isLoadingChatSessionMessages,
        messagesDep: chatSessionMessagesData,
        extraScrollTrigger: isGenerating || placeholderVisible,
    });

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
    }, [isGenerating, messageInputRef]);

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
        <ConversationStaleBaseReleaseProvider staleBaseRelease={conversationStaleBaseRelease}>
                <ConversationSessionMessagesProvider messages={chatSessionMessages}>
                    <LiveProductionTimelineProvider projectId={projectIdOrUndefined}>
                        <StickyMessageGroupsProvider>
                            <PageTitleBox
                                title={title}
                                tools={
                                    <div className="flex min-w-0 shrink-0 items-center gap-2">
                                        <ConversationStaleBaseReleaseTitleBadge />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" size="sm" onClick={toggleSidebar}>
                                                    <SidebarIcon className="size-4 rotate-180" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">Toggle draft units ({SHORTCUT_LABELS.SECONDARY_SIDEBAR})</TooltipContent>
                                        </Tooltip>
                                    </div>
                                }
                            >
                                {isFetchingPreviousPage && (
                                    <Spinner className="size-8 absolute top-[100%] mt-2 left-1/2 -translate-x-1/2 text-blue-500" />
                                )}
                            </PageTitleBox>
                            <StickyMessageBars />
                            <SecondarySidebar>
                                <SecondarySideBar />
                            </SecondarySidebar>
                            <SidebarInset>
                                <Container>
                                    {hasPreviousPage && <div ref={loadMoreRef} className="h-px w-full shrink-0" aria-hidden />}
                                    <div
                                        className={cn(
                                            "flex flex-col gap-0 min-h-0 min-w-0 flex-1 pb-4 overflow-x-hidden",
                                            MIDDLE_CONTENT_CLASSNAME,
                                        )}
                                    >
                                        {displayRootMessages.map((message) => (
                                            <MessageBranch
                                                key={message.id}
                                                message={message}
                                                childrenByParentId={displayChildrenByParentId}
                                                onRetry={handleRetryMessage}
                                                onRetryFailedPlannerMessage={handleRetryFailedPlannerMessage}
                                                plannerRetryPendingMessageId={plannerRetryPendingMessageId}
                                                onRequestEditMessage={(m) =>
                                                    setBranchTruncateDialog({ open: true, mode: "edit", message: m })
                                                }
                                                onRequestRevertToThisMessage={(m) =>
                                                    setBranchTruncateDialog({ open: true, mode: "revert", message: m })
                                                }
                                                isTruncatingBranch={truncatingBranchMessageId != null}
                                                isAnyMessageGenerating={isAnyMessageGenerating}
                                            />
                                        ))}
                                        {shouldShowTemporaryMessageBeforeRedirecting && (
                                            <Message
                                                message={temporaryMessageBeforeRedirectingToNewSession}
                                                onRetry={handleRetryTemporaryMessageBeforeRedirectingToNewSession}
                                            />
                                        )}
                                        {lastAiEndStatus === "failed" && !isGenerating && (
                                            <GenerationSessionEndBanner variant="failed" />
                                        )}
                                        {lastAiEndStatus === "stopped" && !isGenerating && (
                                            <GenerationSessionEndBanner variant="stopped" />
                                        )}
                                        {(isGenerating || placeholderVisible) && (
                                            <div ref={responsePlaceholderRef} className="h-[30vh] w-full shrink-0 relative" />
                                        )}
                                    </div>
                                    <Controls
                                        composerResetKey={
                                            projectId != null && projectId !== ""
                                                ? `${projectId}:${conversationId ?? "new"}`
                                                : (conversationId ?? "new")
                                        }
                                        messageInputRef={messageInputRef}
                                        messageInputValue={messageInput}
                                        setMessageInputValue={setMessageInput}
                                        handleSend={handleSend}
                                        handleStop={handleStop}
                                        canSend={canSend}
                                        isGenerating={isGenerating}
                                        isNewSession={noConversation && !shouldShowTemporaryMessageBeforeRedirecting}
                                        followScroll={
                                            chatSessionIdOrUndefined
                                                ? {
                                                      pinnedToBottom: followScrollPinned,
                                                      onJumpToLatest: jumpFollowScrollToBottom,
                                                  }
                                                : undefined
                                        }
                                    />
                                </Container>
                                <AlertDialog
                                    open={branchTruncateDialog.open}
                                    onOpenChange={handleBranchTruncateDialogOpenChange}
                                >
                                    <AlertDialogContent className="sm:max-w-lg">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {branchTruncateDialog.mode === "edit"
                                                    ? "Edit from this message?"
                                                    : "Revert to this message?"}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription asChild>
                                                <div className="space-y-3 text-sm text-muted-foreground">
                                                    <p>
                                                        Everything after this point in the conversation will be permanently removed.
                                                    </p>
                                                    <p>
                                                        That includes non-live stage and production releases created later on this
                                                        timeline, all live stage releases associated with it, and any runtimes that
                                                        were attached to those live stage releases (those connections will be cleared).
                                                    </p>
                                                    <p className="text-destructive">This cannot be undone.</p>
                                                </div>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={truncatingBranchMessageId != null}>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                type="button"
                                                className={cn(
                                                    buttonVariants({ variant: "destructive" }),
                                                    "inline-flex items-center gap-2",
                                                )}
                                                disabled={truncatingBranchMessageId != null}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    void handleConfirmBranchTruncate();
                                                }}
                                            >
                                                {truncatingBranchMessageId != null ? (
                                                    <>
                                                        <Spinner className="size-3 shrink-0" aria-hidden />
                                                        {branchTruncateDialog.mode === "edit" ? "Preparing…" : "Reverting…"}
                                                    </>
                                                ) : branchTruncateDialog.mode === "edit" ? (
                                                    "Continue to edit"
                                                ) : (
                                                    "Revert"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarInset>
                        </StickyMessageGroupsProvider>
                    </LiveProductionTimelineProvider>
                </ConversationSessionMessagesProvider>
            </ConversationStaleBaseReleaseProvider>
    );
}
