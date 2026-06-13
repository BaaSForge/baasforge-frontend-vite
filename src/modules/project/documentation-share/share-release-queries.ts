import { QueryKeys } from "@/constants/query-keys";
import type { ListReleaseUnitsAllRequest } from "@/modules/project/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    getSharedProjectDetail,
    getSharedReleaseContexts,
    postSharedListReleaseUnitsAll,
    postSharedModulesByContexts,
} from "./share-release-api";

function stableReleaseUnitsAllKey(body: ListReleaseUnitsAllRequest): string {
    const o: Record<string, unknown> = {};
    if (body.page !== undefined) o.page = body.page;
    if (body.page_size !== undefined) o.page_size = body.page_size;
    if (body.unit_types !== undefined) o.unit_types = [...body.unit_types].sort();
    if (body.context_slugs !== undefined) o.context_slugs = [...body.context_slugs].sort();
    if (body.context_module_pairs !== undefined) {
        o.context_module_pairs = [...body.context_module_pairs]
            .map((p) => ({ c: p.context_slug, m: p.module_slug }))
            .sort((a, b) => a.c.localeCompare(b.c) || a.m.localeCompare(b.m));
    }
    if (body.units_paths != null && body.units_paths.length > 0) {
        o.units_paths = [...body.units_paths].sort((a, b) => a.localeCompare(b));
    }
    return JSON.stringify(o);
}

export function useSharedProjectDetailQuery(projectId: string | undefined, shareSecret: string | undefined) {
    return useQuery({
        queryKey: QueryKeys.documentationShareProjectDetail(projectId ?? "", shareSecret ?? ""),
        queryFn: () => getSharedProjectDetail(projectId!, shareSecret!),
        enabled: !!projectId && !!shareSecret?.trim(),
        retry: false,
    });
}

export function useSharedReleaseContextsQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    shareSecret: string | undefined,
    options?: { enabled?: boolean },
) {
    const enabled = (options?.enabled ?? true) && !!projectId && !!releaseId && !!shareSecret?.trim();
    return useQuery({
        queryKey: QueryKeys.documentationShareReleaseContexts(projectId ?? "", releaseId ?? "", shareSecret ?? ""),
        queryFn: () => getSharedReleaseContexts(projectId!, releaseId!, shareSecret!),
        enabled,
        retry: false,
    });
}

export function useSharedModulesByContextsQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    shareSecret: string | undefined,
    contextSlugs: string[],
    options?: { enabled?: boolean },
) {
    const sortedKey = [...contextSlugs].sort().join("\u0000");
    const hasSlug = contextSlugs.some((s) => s.trim().length > 0);
    const enabled =
        (options?.enabled ?? true) && !!projectId && !!releaseId && !!shareSecret?.trim() && hasSlug;
    return useQuery({
        queryKey: QueryKeys.documentationShareModulesByContexts(
            projectId ?? "",
            releaseId ?? "",
            shareSecret ?? "",
            sortedKey,
        ),
        queryFn: () => postSharedModulesByContexts(projectId!, releaseId!, shareSecret!, { context_slugs: contextSlugs }),
        enabled,
        retry: false,
    });
}

export function useSharedReleaseUnitsAllQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    shareSecret: string | undefined,
    body: ListReleaseUnitsAllRequest | undefined,
    options?: { enabled?: boolean },
) {
    const enabled =
        (options?.enabled ?? true) && !!projectId && !!releaseId && !!shareSecret?.trim() && body != null;
    const requestKey = body != null ? stableReleaseUnitsAllKey(body) : "";
    return useQuery({
        queryKey: QueryKeys.documentationShareReleaseUnitsAll(
            projectId ?? "",
            releaseId ?? "",
            shareSecret ?? "",
            requestKey,
        ),
        queryFn: () => postSharedListReleaseUnitsAll(projectId!, releaseId!, shareSecret!, body!),
        enabled,
        retry: false,
    });
}

export function useSharedReleaseUnitsAllPinnedQuery(
    projectId: string | undefined,
    releaseId: string | undefined,
    shareSecret: string | undefined,
    unitPaths: readonly string[],
    options?: { enabled?: boolean },
) {
    const sortedPaths = useMemo(() => [...unitPaths].sort((a, b) => a.localeCompare(b)), [unitPaths]);
    const body = useMemo(() => {
        if (sortedPaths.length === 0) return undefined;
        return { units_paths: sortedPaths };
    }, [sortedPaths]);

    return useSharedReleaseUnitsAllQuery(projectId, releaseId, shareSecret, body, options);
}
