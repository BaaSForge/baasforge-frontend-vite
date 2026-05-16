"use client";

import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Outlet, useLocation, useParams } from "react-router";

function useSettingsTab() {
    const pathname = useLocation().pathname;
    if (pathname.endsWith("/delete")) return "delete";
    return "info";
}

export default function ProjectSettingsLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const tab = useSettingsTab();

    const basePath = `/dashboard/projects/${projectId}/settings`;

    return (
        <Tabs value={tab} className="gap-4">
            <PageTitleBox
                title="Project settings"
                tools={
                    <TabsList>
                        <TabsTrigger value="info" asChild>
                            <Link to={`${basePath}/info`}>Project info</Link>
                        </TabsTrigger>
                        <TabsTrigger value="delete" asChild>
                            <Link to={`${basePath}/delete`}>Delete project</Link>
                        </TabsTrigger>
                    </TabsList>
                }
            />
            <Container>
                <TabsContent value="info" className="mt-0">
                    <Outlet />
                </TabsContent>
                <TabsContent value="delete" className="mt-0">
                    <Outlet />
                </TabsContent>
            </Container>
        </Tabs>
    );
}
