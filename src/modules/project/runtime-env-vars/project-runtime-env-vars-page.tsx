"use client";

import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { useParams, useSearchParams } from "react-router";
import { RuntimeEnvVarsTable } from "./components/runtime-env-vars-table";
import {
    mergeRuntimeEnvVarsSearchParams,
    readRuntimeEnvVarsSearchParams,
    type RuntimeEnvVarsTabValue,
} from "./runtime-env-vars-search-params";

export function ProjectRuntimeEnvVarsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { envTab } = readRuntimeEnvVarsSearchParams(searchParams);

    const projectIdOrUndefined = projectId ?? undefined;
    const projectIdForApi = projectId ?? "";

    const { data: runtimes, isLoading: runtimesLoading, isError: runtimesError } = useProjectRuntimesQuery(projectIdOrUndefined);

    const onEnvTabChange = (v: string) => {
        if (v !== "plain" && v !== "encrypted") return;
        setSearchParams(mergeRuntimeEnvVarsSearchParams(searchParams, { envTab: v as RuntimeEnvVarsTabValue }));
    };

    const tableProps = {
        projectId: projectIdForApi,
        runtimes: runtimes ?? [],
        runtimesLoading,
        runtimesError,
    };

    return (
        <Tabs value={envTab} onValueChange={onEnvTabChange} className="gap-4">
            <PageTitleBox
                title="Runtime environment variables"
                stackToolsOnMobile
                tools={
                    <TabsList>
                        <TabsTrigger value="plain">Non-encrypted</TabsTrigger>
                        <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
                    </TabsList>
                }
            />
            <Container className="w-full min-w-0 pt-0">
                <TabsContent value="plain" className="mt-0">
                    <RuntimeEnvVarsTable isEncrypted={false} {...tableProps} />
                </TabsContent>
                <TabsContent value="encrypted" className="mt-0">
                    <RuntimeEnvVarsTable isEncrypted {...tableProps} />
                </TabsContent>
            </Container>
        </Tabs>
    );
}
