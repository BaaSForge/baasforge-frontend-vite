"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { ServerIcon } from "lucide-react";
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
    };

    const tableContent =
        runtimesLoading ? (
            <ContentLoadingState label="Loading variables…" />
        ) : runtimesError ? (
            <ContentErrorState
                title="Failed to load variables"
                subtitle="Try refreshing the page and try again."
            />
        ) : (runtimes ?? []).length === 0 ? (
            <ContentEmptyState
                title="No runtimes yet"
                description="Add a runtime to this project before setting variables."
                icon={ServerIcon}
            />
        ) : (
            <>
                <TabsContent value="plain" className="mt-0">
                    <RuntimeEnvVarsTable isEncrypted={false} {...tableProps} />
                </TabsContent>
                <TabsContent value="encrypted" className="mt-0">
                    <RuntimeEnvVarsTable isEncrypted {...tableProps} />
                </TabsContent>
            </>
        );

    return (
        <Tabs value={envTab} onValueChange={onEnvTabChange} className="gap-4">
            <PageTitleBox
                title="Runtime variables"
                stackToolsOnMobile
                tools={
                    <TabsList>
                        <TabsTrigger value="plain">Non-encrypted</TabsTrigger>
                        <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
                    </TabsList>
                }
            />
            <Container className="w-full min-w-0 pt-0">{tableContent}</Container>
        </Tabs>
    );
}
