import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
import { useEffect } from "react";
import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSidebar,
  SecondarySidebar,
  SecondarySidebarProvider,
  SidebarContent,
  SidebarInset,
  SECONDARY_SIDEBAR_STORAGE_KEYS,
  useSecondarySidebar,
} from "@/components/secondary-sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectConversationsPage() {
  const mainSidebar = useSidebar();

  return (
    <SecondarySidebarProvider
      storageKey={SECONDARY_SIDEBAR_STORAGE_KEYS.CONVERSATION}
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
  
  return (
    <>
      <PageTitleBox
        title={title}
        mainSidebar={mainSidebar}
        tools={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
                <SidebarIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Toggle draft units
            </TooltipContent>
          </Tooltip>
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
              Conversation {conversationId} (project {projectId})
            </p>
          ) : (
            <p className="text-muted-foreground">
              New conversation for project {projectId}
            </p>
          )}
        </Container>
      </SidebarInset>
    </>
  );
}