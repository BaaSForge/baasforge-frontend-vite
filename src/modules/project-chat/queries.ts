import { QueryKeys } from "@/constants/query-keys";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
    fillPackageTypeDefinitionFileContents,
    fillPackagesTypeDefinitionFiles,
    getProjectChatSessionDetail,
    getProjectChatSessionMessages,
    getProjectChatSessions,
    type ChatSessionListReleaseFilter,
} from "./api";
import type { ChatMessageWithDeliveryStatus } from "./types";

const CHAT_SESSIONS_LIST_PAGE_SIZE = 20;

const CHAT_MESSAGES_PAGE_RETRY_DELAY_MS = 3000;

const EMPTY_GENERATING_SET = new Set<string>();

/** Whether the given project/session is currently generating a response (from WS generation_started/ended). */
export function useIsSessionGenerating(projectId: string | undefined, sessionId: string | undefined): boolean {
    const generating = useQuery({
        queryKey: QueryKeys.chatSessionGeneratingSet(),
        queryFn: () => EMPTY_GENERATING_SET,
        initialData: EMPTY_GENERATING_SET,
        staleTime: Number.POSITIVE_INFINITY,
        select: (set) => (projectId != null && sessionId != null ? set.has(`${projectId}:${sessionId}`) : false),
    });
    return generating.data ?? false;
}

export function useProjectChatSessionsQuery(projectId?: string, options?: { enabled?: boolean }) {
    const userEnabled = options?.enabled ?? true;
    return useQuery({
        enabled: userEnabled && !!projectId,
        queryKey: QueryKeys.projectChatSessionList(projectId ?? ""),
        queryFn: () => getProjectChatSessions(projectId ?? "", { page: 1, page_size: CHAT_SESSIONS_LIST_PAGE_SIZE }).then((r) => r.sessions),
    });
}

export type ProjectChatSessionsListFilters = {
    release_filters: ChatSessionListReleaseFilter[];
    unit_filters: string[];
};

function chatSessionsListFiltersKey(filters: ProjectChatSessionsListFilters): string {
    return JSON.stringify([filters.release_filters, filters.unit_filters]);
}

export function useProjectChatSessionsInfiniteQuery(
    projectId: string | undefined,
    filters: ProjectChatSessionsListFilters,
    options?: { enabled?: boolean },
) {
    const userEnabled = options?.enabled ?? true;
    const filtersKey = chatSessionsListFiltersKey(filters);
    return useInfiniteQuery({
        enabled: userEnabled && !!projectId,
        queryKey: [...QueryKeys.projectChatSessionList(projectId ?? ""), "infinite", filtersKey] as const,
        queryFn: ({ pageParam }: { pageParam: number }) =>
            getProjectChatSessions(projectId!, {
                page: pageParam,
                page_size: CHAT_SESSIONS_LIST_PAGE_SIZE,
                release_filters: filters.release_filters.length > 0 ? filters.release_filters : undefined,
                unit_filters: filters.unit_filters.length > 0 ? filters.unit_filters : undefined,
            }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const loaded = last.page * last.page_size;
            if (loaded >= last.total) return undefined;
            return last.page + 1;
        },
    });
}

export function useProjectChatSessionDetailQuery(projectId?: string, chatSessionId?: string) {
    return useQuery({
        enabled: !!projectId && !!chatSessionId,
        queryKey: QueryKeys.projectChatSessionDetail(projectId ?? "", chatSessionId ?? ""),
        queryFn: () => getProjectChatSessionDetail(projectId ?? "", chatSessionId ?? ""),
    });
}

export function useProjectChatSessionMessagesQuery(projectId?: string, chatSessionId?: string) {
    return useInfiniteQuery({
        enabled: !!projectId && !!chatSessionId,
        queryKey: QueryKeys.projectChatSessionMessages(projectId ?? "", chatSessionId ?? ""),
        queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
            getProjectChatSessionMessages(projectId ?? "", chatSessionId ?? "", {
                before_id: pageParam,
            }),
        retryDelay: CHAT_MESSAGES_PAGE_RETRY_DELAY_MS,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: () => undefined,
        getPreviousPageParam: (firstPage: ChatMessageWithDeliveryStatus[]) => {
            if (firstPage.length === 0) {
                return undefined;
            }

            const firstMessage = firstPage[0];

            // Skip page load if the first message is optimistic, which means chat has been created just now
            // or if it is the real first message
            if (firstMessage?.is_optimistic === true || firstMessage?.is_first === true) {
                return undefined;
            }

            return firstMessage.id;
        },
    });
}

export function usePackagesTypeDefinitionFilesQuery(
    packages: readonly string[],
    options?: { enabled?: boolean },
) {
    const packagesKey = [...packages].sort().join(",");
    const userEnabled = options?.enabled ?? true;
    return useQuery({
        enabled: userEnabled && packages.length > 0,
        queryKey: QueryKeys.packagesTypeDefinitionFiles(packagesKey),
        queryFn: () => fillPackagesTypeDefinitionFiles([...packages]),
    });
}

export function usePackageTypeDefinitionFileContentsQuery(
    files: readonly string[],
    options?: { enabled?: boolean },
) {
    const filesKey = [...files].sort().join(",");
    const userEnabled = options?.enabled ?? true;
    return useQuery({
        enabled: userEnabled && files.length > 0,
        queryKey: QueryKeys.packageTypeDefinitionFileContents(filesKey),
        queryFn: () => fillPackageTypeDefinitionFileContents([...files]),
    });
}
