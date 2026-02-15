import { useParams } from "react-router";
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
import { useProjectChatSessionDetailQuery } from "@/modules/project-chat/queries";
import { ConnectIcon, DisconnectIcon } from "@/modules/project/stores/runtime-store";
import { FancyButton } from "@/components/fancy-button";
import { RuntimesModal } from "@/modules/project";

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

  const { data: chatSession, isLoading: isLoadingChatSession } = useProjectChatSessionDetailQuery(Number(projectId), Number(conversationId));
  
  if (isLoadingChatSession) {
    return <div>Loading chat session...</div>;
  }

  if (chatSession == null) {
    return <div>Chat session not found</div>;
  }

  return (
    <>
      <PageTitleBox
        title={title}
        mainSidebar={mainSidebar}
        tools={
          <>
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
          {conversationId ? (
            <p className="text-muted-foreground">
              Conversation {chatSession.title} (project {projectId})
            </p>
          ) : (
            <p className="text-muted-foreground">
              New conversation for project {projectId}
            </p>
          )}
        </Container>
      </SidebarInset>
      <RuntimesModal
        open={runtimesModalOpen}
        onOpenChange={setRuntimesModalOpen}
        projectId={Number(projectId)}
        chatSessionId={Number(chatSession.id)}
        alreadyConnectedRuntimeId={chatSession.stage_project_runtime_id}
      />
    </>
  );
}