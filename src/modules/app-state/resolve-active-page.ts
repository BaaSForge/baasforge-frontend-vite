import { matchPath } from "react-router";

import { ActivePage, PAGE_ROUTE_MATCHES, type ActivePage as ActivePageType } from "./pages";

export type PathParams = Record<string, string>;

export type RouteState = {
    activePage: ActivePageType;
    pathParams: PathParams;
};

const EMPTY_PARAMS: PathParams = {};

function normalizeParams(params: Record<string, string | undefined> | undefined): PathParams {
    if (params == null) return EMPTY_PARAMS;

    const normalized: PathParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (value != null) normalized[key] = value;
    }
    return normalized;
}

export function resolveActivePage(pathname: string): RouteState {
    for (const route of PAGE_ROUTE_MATCHES) {
        const match = matchPath({ path: route.path, end: route.end ?? false }, pathname);
        if (match == null) continue;

        const pathParams = normalizeParams(match.params);
        if (route.when != null && !route.when(pathname, pathParams)) continue;

        return { activePage: route.page, pathParams };
    }

    return { activePage: ActivePage.UNKNOWN, pathParams: EMPTY_PARAMS };
}
