import { useNavigate, useParams } from "react-router";
import { useLayoutEffect, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
import { useState } from "react";
import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSidebar,
  SecondarySidebar,
  SecondarySidebarProvider,
  SidebarContent,
  SidebarInset,
  useSecondarySidebar,
} from "@/components/secondary-sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useProjectChatSessionDetailQuery, useProjectChatSessionMessagesQuery } from "@/modules/project-chat/queries";
import {
  useCreateProjectChatSessionMutation,
  useCreateProjectChatSessionMessageMutation,
} from "@/modules/project-chat/mutations";
import { ConnectIcon, DisconnectIcon } from "@/modules/project/stores/runtime-store";
import { FancyButton } from "@/components/fancy-button";
import { RuntimesModal } from "@/modules/project";
import { ChatMessageDeliveryStatus, ChatMessageType, ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import Controls from "./components/controls";
import { Message } from "./components/message";
import { ScrollBehavior, scrollToBottom, scrollToTop } from "@/lib/dom";
import { MIDDLE_CONTENT_CLASSNAME } from "./constants";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useCaptureDocumentScroll, useSubscribeSession } from "./hooks";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectConversationsPage() {
  const mainSidebar = useSidebar();

  return (
    <SecondarySidebarProvider
      storageKey={STORAGE_KEYS.CONVERSATION_SIDEBAR_COLLAPSED}
      defaultOpen
    >
      <ProjectConversationsContent mainSidebar={mainSidebar} />
    </SecondarySidebarProvider>
  );
}

type ProjectConversationsContentProps = {
  mainSidebar: Sidebar;
}

function ProjectConversationsContent({ mainSidebar }: ProjectConversationsContentProps) {
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const justRedirectedToNewSessionRef = useRef(false);
  const [temporaryMessageBeforeRedirectingToNewSession, setTemporaryMessageBeforeRedirectingToNewSession] = useState<ChatMessageWithDeliveryStatus | undefined>();
  const [shouldShowResponsePlaceholder, setShouldShowResponsePlaceholder] = useState(false);
  const [runtimesModalOpen, setRuntimesModalOpen] = useState(false);
  const {
    setOpenSkipStorage,
    toggleSidebar,
    rereadSidebarOpen,
  } = useSecondarySidebar();
  const { conversationId, projectId } = useParams<{
    conversationId?: string;
    projectId: string;
  }>();

  const title = conversationId
    ? "Conversation"
    : "New conversation";

  const noConversation = conversationId == null;

  useEffect(() => {
    if (noConversation) {
      setOpenSkipStorage?.(false);
    } else {
      rereadSidebarOpen?.();
    }
  }, [noConversation, rereadSidebarOpen, setOpenSkipStorage]);

  const navigate = useNavigate();
  const projectIdNum = Number(projectId);
  const chatSessionIdNum = conversationId != null ? Number(conversationId) : undefined;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemporaryMessageBeforeRedirectingToNewSession(undefined);

    if (justRedirectedToNewSessionRef.current) {
      justRedirectedToNewSessionRef.current = false;
    } else {
      setShouldShowResponsePlaceholder(false);
    }
  }, [chatSessionIdNum]);

  useLayoutEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [chatSessionIdNum]);

  const { data: chatSession } = useProjectChatSessionDetailQuery(projectIdNum, chatSessionIdNum);

  useSubscribeSession(projectIdNum, chatSessionIdNum ?? undefined);

  const {
    data: chatSessionMessagesData,
    isLoading: isLoadingChatSessionMessages,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  } = useProjectChatSessionMessagesQuery(projectIdNum, chatSessionIdNum);

  const firstMessage = chatSessionMessagesData?.pages[0][0];
  const captureDocumentScroll = useCaptureDocumentScroll(firstMessage?.id);

  const chatSessionMessages = (chatSessionMessagesData?.pages ?? [])
    .flatMap((page) => [...page]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasPreviousPage || isFetchingPreviousPage || !chatSessionIdNum) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchPreviousPage().then(captureDocumentScroll);
        }
      },
      { rootMargin: "80px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage, chatSessionIdNum, captureDocumentScroll]);

  const createSessionMutation = useCreateProjectChatSessionMutation(projectIdNum);
  const createMessageMutation = useCreateProjectChatSessionMessageMutation();

  const [messageInput, setMessageInput] = useState("");

  // Note: we may need to use useLayoutEffect here to ensure the scroll is smooth
  useEffect(() => {
    if (isLoadingChatSessionMessages || !chatSessionIdNum) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  }, [isLoadingChatSessionMessages, chatSessionIdNum]);

  const isCreatingSession = createSessionMutation.isPending;
  const isSendingMessage = createMessageMutation.isPending;
  const canSendNewConversation =
    noConversation && messageInput.trim() !== "" && !isCreatingSession;
  const canSendExistingConversation =
    !!chatSession &&
    !!chatSessionIdNum &&
    messageInput.trim() !== "" &&
    !isSendingMessage;
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
          projectId: projectIdNum,
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
  }

  const handleRetryTemporaryMessageBeforeRedirectingToNewSession = () => {
    createSessionThenMessage(temporaryMessageBeforeRedirectingToNewSession!);
  }

  const handleSend = () => {
    if (!canSend) return;

    const payload = messageInput.trim();
    setMessageInput("");

    const optimisticMessage: ChatMessageWithDeliveryStatus = {
      id: Date.now(),
      chat_session_id: chatSessionIdNum ?? 0,
      role: ChatSessionRoleType.User,
      type: ChatMessageType.Text,
      payload,
      created_at: new Date().toISOString(),
      delivery_status: ChatMessageDeliveryStatus.Pending,
      is_optimistic: true,
      is_first: false,
    };

    if (noConversation) {
      createSessionThenMessage(optimisticMessage);
    } else {
      createMessageMutation.mutate({
        projectId: projectIdNum,
        chatSessionId: chatSessionIdNum ?? 0,
        optimisticMessage,
      });

      flushSync(() => {
        setShouldShowResponsePlaceholder(true);
      });

      scrollToBottom(undefined, ScrollBehavior.Smooth);
    }
  };

  const handleRetryMessage = (message: ChatMessageWithDeliveryStatus) => {
    createMessageMutation.mutate({
      projectId: projectIdNum,
      chatSessionId: chatSessionIdNum ?? 0,
      optimisticMessage: message,
    });
  }

  const shouldShowTemporaryMessageBeforeRedirecting = temporaryMessageBeforeRedirectingToNewSession != null && !chatSessionIdNum;

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
                <TooltipContent side="bottom">
                  See runtimes operations
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" onClick={toggleSidebar}>
                  <SidebarIcon className="size-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle draft units
              </TooltipContent>
            </Tooltip>
          </>
        }
      >
        {isFetchingPreviousPage && (
          <Spinner className="size-8 absolute top-[100%] mt-2 left-1/2 -translate-x-1/2 text-blue-500" />
        )}
      </PageTitleBox>
      <SecondarySidebar>
        <SidebarContent>
          <SecondarySideBar />
        </SidebarContent>
      </SecondarySidebar>
      <SidebarInset>
        <Container>
          {hasPreviousPage && (
            <div
              ref={loadMoreRef}
              className="h-px w-full shrink-0"
              aria-hidden
            />
          )}
          <div className={cn("flex flex-col gap-0 min-h-0 flex-1 pb-4", MIDDLE_CONTENT_CLASSNAME)}>
            {chatSessionMessages?.map((message) => (
              <Message
                key={message.id}
                message={message}
                onRetry={handleRetryMessage}
              />
            ))}
            {shouldShowTemporaryMessageBeforeRedirecting && (
              <Message
                message={temporaryMessageBeforeRedirectingToNewSession}
                onRetry={handleRetryTemporaryMessageBeforeRedirectingToNewSession}
              />
            )}
            {shouldShowResponsePlaceholder && (
              <div className="h-[60vh] w-full shrink-0 relative" />
            )}
          </div>
          <Controls
            messageInputRef={messageInputRef}
            messageInputValue={messageInput}
            setMessageInputValue={setMessageInput}
            handleSend={handleSend}
            canSend={canSend}
            isNewSession={noConversation && !shouldShowTemporaryMessageBeforeRedirecting}
            mainSidebar={mainSidebar}
          />
        </Container>
      </SidebarInset>
      {chatSession && (
        <RuntimesModal
          open={runtimesModalOpen}
          onOpenChange={setRuntimesModalOpen}
          projectId={Number(projectId)}
          chatSessionId={Number(chatSession.id)}
          alreadyConnectedRuntimeId={chatSession.stage_project_runtime_id}
        />
      )}
    </>
  );
}
