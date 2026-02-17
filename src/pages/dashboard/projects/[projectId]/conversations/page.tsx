import { useNavigate, useParams } from "react-router";
import { useLayoutEffect, useRef } from "react";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
import { useEffect, useState } from "react";
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
import { scrollToBottom, scrollToTop } from "@/lib/dom";

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
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [temporaryMessageBeforeRedirectingToNewSession, setTemporaryMessageBeforeRedirectingToNewSession] = useState<ChatMessageWithDeliveryStatus | undefined>();
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
      setOpenSkipStorage(false);
    } else {
      rereadSidebarOpen();
    }
  }, [noConversation, rereadSidebarOpen]);

  const navigate = useNavigate();
  const projectIdNum = Number(projectId);
  const chatSessionIdNum = conversationId != null ? Number(conversationId) : undefined;

  useEffect(() => {
    setTemporaryMessageBeforeRedirectingToNewSession(undefined);
  }, [chatSessionIdNum]);

  useLayoutEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [chatSessionIdNum]);

  const { data: chatSession, isLoading: isLoadingChatSession } = useProjectChatSessionDetailQuery(projectIdNum, chatSessionIdNum);
  const {
    data: chatSessionMessages,
    isLoading: isLoadingChatSessionMessages,
  } = useProjectChatSessionMessagesQuery(projectIdNum, chatSessionIdNum);
  const createSessionMutation = useCreateProjectChatSessionMutation(projectIdNum);
  const createMessageMutation = useCreateProjectChatSessionMessageMutation();

  const [messageInput, setMessageInput] = useState("");

  useLayoutEffect(() => {
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
    };

    setTemporaryMessageBeforeRedirectingToNewSession(optimisticMessage);

    if (noConversation) {
      createSessionMutation.mutate(undefined, {
        onSuccess: (session) => {
          if (!session) return;

          createMessageMutation.mutate({
            projectId: projectIdNum,
            chatSessionId: session.id,
            optimisticMessage,
          });

          navigate(`/dashboard/projects/${projectId}/conversations/${session.id}`);
        },
      });
    } else {
      createMessageMutation.mutate({
        projectId: projectIdNum,
        chatSessionId: chatSessionIdNum ?? 0,
        optimisticMessage,
      });
    }
  };

  // @ts-expect-error - TODO: use as an overlay
  const isLoading = isLoadingChatSession || isLoadingChatSessionMessages;
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
      />
      <SecondarySidebar>
        <SidebarContent>
          <SecondarySideBar />
        </SidebarContent>
      </SecondarySidebar>
      <SidebarInset className="here-is-the-content">
        <Container>
          {chatSession ? (
            <p className="text-muted-foreground">
              Conversation {chatSession.title} (project {projectId})
            </p>
          ) : (
            <p className="text-muted-foreground">
              New conversation for project {projectId}
            </p>
          )}
          <div className="flex flex-col-reverse overflow-y-auto min-h-0 flex-1">
            {chatSessionMessages?.map((message) => (
              <div key={message.id}>
                <p>{message.payload}</p>
                <p>{message.delivery_status}</p>
              </div>
            ))}
            {shouldShowTemporaryMessageBeforeRedirecting && (
              <div key={temporaryMessageBeforeRedirectingToNewSession.id}>
                <p>{temporaryMessageBeforeRedirectingToNewSession.payload}</p>
                <p>{temporaryMessageBeforeRedirectingToNewSession.delivery_status}</p>
              </div>
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