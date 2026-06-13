"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProjectDetailResponse } from "@/modules/project/types";
import { useSharedProjectDetailQuery } from "./share-release-queries";

type ShareProjectRuntimeContextValue = {
    detail?: ProjectDetailResponse;
};

const ShareProjectRuntimeContext = createContext<ShareProjectRuntimeContextValue | null>(null);

export function useShareDocumentationViewer(): boolean {
    return useContext(ShareProjectRuntimeContext) != null;
}

export function useShareProjectRuntimeDetail(): ProjectDetailResponse | undefined {
    return useContext(ShareProjectRuntimeContext)?.detail;
}

export function ShareProjectRuntimeProvider({
    projectId,
    shareSecret,
    children,
}: {
    projectId: string;
    shareSecret: string;
    children: ReactNode;
}) {
    const { data } = useSharedProjectDetailQuery(projectId, shareSecret);
    return (
        <ShareProjectRuntimeContext.Provider value={{ detail: data }}>{children}</ShareProjectRuntimeContext.Provider>
    );
}
