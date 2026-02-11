"use client";

import { Link, Outlet, useLocation, useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectQuery } from "@/modules/project";

function useSettingsTab() {
  const pathname = useLocation().pathname;
  if (pathname.endsWith("/delete")) return "delete";
  return "info";
}

export default function ProjectSettingsLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = projectId ? parseInt(projectId, 10) : undefined;
  const tab = useSettingsTab();
  const { data: project } = useProjectQuery(id);

  const basePath = `/dashboard/projects/${projectId}/settings`;

  return (
    <Container>
      <PageTitleBox
        title={project ? `Settings — ${project.name}` : "Project settings"}
      />
      <Container.MainContent>
        <Tabs value={tab} className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="info" asChild>
            <Link to={`${basePath}/info`}>Project info</Link>
          </TabsTrigger>
          <TabsTrigger value="delete" asChild>
            <Link to={`${basePath}/delete`}>Delete project</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-0">
          <Outlet />
        </TabsContent>
        <TabsContent value="delete" className="mt-0">
          <Outlet />
        </TabsContent>
      </Tabs>
      </Container.MainContent>
    </Container>
  );
}
