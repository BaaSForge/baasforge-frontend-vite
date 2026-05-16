"use client";

import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { useProjectRuntimesQuery } from "@/modules/project/queries";
import { useParams } from "react-router";
import { RuntimeEnvVarsTable } from "./components/runtime-env-vars-table";

export function ProjectRuntimeEnvVarsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const projectIdOrUndefined = projectId ?? undefined;
    const projectIdForApi = projectId ?? "";

    const { data: runtimes, isLoading: runtimesLoading, isError: runtimesError } = useProjectRuntimesQuery(projectIdOrUndefined);

    return (
        <>
            <PageTitleBox title="Runtime environment variables" />
            <Container className="flex flex-col gap-8">
                <section className="w-full min-w-0 md:w-1/2">
                    <RuntimeEnvVarsTable
                        title="Encrypted variables"
                        projectId={projectIdForApi}
                        isEncrypted
                        runtimes={runtimes ?? []}
                        runtimesLoading={runtimesLoading}
                        runtimesError={runtimesError}
                    />
                </section>
                <section className="w-full min-w-0 md:w-1/2">
                    <RuntimeEnvVarsTable
                        title="Non-encrypted variables"
                        projectId={projectIdForApi}
                        isEncrypted={false}
                        runtimes={runtimes ?? []}
                        runtimesLoading={runtimesLoading}
                        runtimesError={runtimesError}
                    />
                </section>
            </Container>
        </>
    );
}
