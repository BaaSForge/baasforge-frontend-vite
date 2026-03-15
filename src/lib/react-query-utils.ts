import { type InfiniteData } from "@tanstack/react-query";

export function modifyInfiniteCacheData<T>(old: InfiniteData<T[]> | undefined, updater: (pages: T[][]) => T[][]): InfiniteData<T[]> {
    const pages = old?.pages ?? [];

    return {
        pages: updater(pages),
        pageParams: old?.pageParams ?? [],
    };
}
