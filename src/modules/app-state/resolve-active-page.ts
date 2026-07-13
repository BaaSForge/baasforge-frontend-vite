import type { UIMatch } from "react-router";

import { ActivePage, type ActivePage as ActivePageType, type AppRouteHandle } from "@/pages/routes";

export type PathParams = Record<string, string>;

export type AppSearchParams = Record<string, readonly string[]>;

export type RouteState = {
    activePage: ActivePageType;
    pathParams: PathParams;
    pathname: string;
    searchParams: AppSearchParams;
};

export type { AppRouteHandle };

export function parseAppSearchParams(search: string): AppSearchParams {
    const urlSearchParams = new URLSearchParams(search);
    const result: Record<string, string[]> = {};

    for (const key of urlSearchParams.keys()) {
        if (key in result) continue;
        result[key] = urlSearchParams.getAll(key);
    }

    return result;
}

export function resolveRouteStateFromMatches(
    matches: UIMatch[],
    pathParams: PathParams,
    pathname: string,
    search: string,
): RouteState {
    const searchParams = parseAppSearchParams(search);

    for (let index = matches.length - 1; index >= 0; index--) {
        const page = (matches[index].handle as AppRouteHandle | undefined)?.page;
        if (page != null) {
            return { activePage: page, pathParams, pathname, searchParams };
        }
    }

    return { activePage: ActivePage.UNKNOWN, pathParams, pathname, searchParams };
}
