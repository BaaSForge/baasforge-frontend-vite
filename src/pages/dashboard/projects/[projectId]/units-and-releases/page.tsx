import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SecondarySideBar } from "./secondary-side-bar";
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

type Sidebar = ReturnType<typeof useSidebar>;

export default function ProjectUnitsAndReleasesPage() {
  const mainSidebar = useSidebar();

  return (
    <SecondarySidebarProvider
      storageKey={SECONDARY_SIDEBAR_STORAGE_KEYS.UNITS_AND_RELEASES}
      defaultOpen
    >
      <ProjectUnitsAndReleasesContent mainSidebar={mainSidebar} />
    </SecondarySidebarProvider>
  );
}

type ProjectUnitsAndReleasesContentProps = {
  mainSidebar: Sidebar;
}

function ProjectUnitsAndReleasesContent({ mainSidebar }: ProjectUnitsAndReleasesContentProps) {
  const { toggleSidebar } = useSecondarySidebar();
  const title = "Units and releases";

  return (
    <>
      <PageTitleBox
        title={title}
        mainSidebar={mainSidebar}
        tools={
          <Button variant="secondary" className="rotate-180" size="sm" onClick={toggleSidebar}>
            <SidebarIcon className="size-4" />
          </Button>
        }
      />
      <SecondarySidebar>
        <SidebarContent>
          <SecondarySideBar />
        </SidebarContent>
      </SecondarySidebar>
      <SidebarInset className="here-is-the-content">
        <Container>
          <p className="text-muted-foreground">
            Releases
          </p>
        </Container>
      </SidebarInset>
    </>
  );
}