import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  useStickyBreadcrumbBarHeight,
  useStickyBreadcrumbBarTransition,
  useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import { SecondarySideBar } from "./secondary-side-bar";

export default function ProjectConversationsPage() {
  const { isMobile } = useSidebar();
  const stickyBarVisible = useStickyBreadcrumbBarVisible();
  const stickyBarHeight = useStickyBreadcrumbBarHeight();
  const stickyBarTransition = useStickyBreadcrumbBarTransition();
  const { projectId, conversationId } = useParams<{
    projectId: string;
    conversationId?: string;
  }>();

  const title = conversationId
    ? "Conversation"
    : "New conversation";

  const pageTitleBoxClassName = isMobile ? "" : "w-[calc(100%-var(--sidebar-width))]";

  return (
    <Container>
      <PageTitleBox title={title} className={pageTitleBoxClassName} tools="something here" />
      <SidebarProvider>
        <SidebarInset>
          <div className="flex flex-1 flex-col px-4">
            {conversationId ? (
              <p className="text-muted-foreground">
                Conversation {conversationId} (project {projectId})
              </p>
            ) : (
              <p className="text-muted-foreground">
                New conversation for project {projectId}
              </p>
            )}
          </div>
        </SidebarInset>
        <Sidebar
          side="right"
          style={{
            top: stickyBarVisible ? stickyBarHeight : 0,
            transition: `top ${stickyBarTransition}`,
          }}
        >
          <SidebarContent>
            <SecondarySideBar />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </Container>
  );
}
