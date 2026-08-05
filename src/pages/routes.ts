import { matchRoutes } from "react-router";
import type { RouteObject } from "react-router";

import { appRoutes } from "./router";

export const ActivePage = {
    HOME: "HOME",
    PRICING: "PRICING",
    LOGIN: "LOGIN",
    DASHBOARD: "DASHBOARD",
    DASHBOARD_PACKAGES: "DASHBOARD_PACKAGES",
    DASHBOARD_PAYMENTS: "DASHBOARD_PAYMENTS",
    DASHBOARD_PURCHASE: "DASHBOARD_PURCHASE",
    DASHBOARD_BILLING_SUCCESS: "DASHBOARD_BILLING_SUCCESS",
    DASHBOARD_BILLING_CANCEL: "DASHBOARD_BILLING_CANCEL",
    DASHBOARD_USAGE: "DASHBOARD_USAGE",
    DASHBOARD_TOKENS: "DASHBOARD_TOKENS",
    PROJECTS: "PROJECTS",
    CREATE_PROJECT: "CREATE_PROJECT",
    PROJECT_SHELL: "PROJECT_SHELL",
    PROJECT_OVERVIEW: "PROJECT_OVERVIEW",
    PROJECT_SETTINGS_INFO: "PROJECT_SETTINGS_INFO",
    PROJECT_SETTINGS_DELETE: "PROJECT_SETTINGS_DELETE",
    NEW_CHAT: "NEW_CHAT",
    CHAT: "CHAT",
    UNITS_RELEASES: "UNITS_RELEASES",
    UNITS_RELEASES_DETAIL: "UNITS_RELEASES_DETAIL",
    RUNTIMES: "RUNTIMES",
    RUNTIME_DETAIL: "RUNTIME_DETAIL",
    RUNTIME_UNITS_RELEASES: "RUNTIME_UNITS_RELEASES",
    RUNTIME_ENV_VARS: "RUNTIME_ENV_VARS",
    PROJECT_USAGE: "PROJECT_USAGE",
    DOCUMENTATION_SHARE: "DOCUMENTATION_SHARE",
    SERVER_ERROR: "SERVER_ERROR",
    UNKNOWN: "UNKNOWN",
} as const;

export type ActivePage = (typeof ActivePage)[keyof typeof ActivePage];

export type AppPage = Exclude<ActivePage, typeof ActivePage.UNKNOWN>;

export type AppRouteHandle = {
    page: ActivePage;
};

export type AppRouteObject = RouteObject & {
    page?: AppPage;
    children?: AppRouteObject[];
};

type CollectedPageRoute = {
    page: AppPage;
    path: string;
};

function joinPath(parent: string, segment: string): string {
    if (!segment) return parent || "/";
    if (segment.startsWith("/")) return segment;
    const base = parent === "/" ? "" : parent;
    return `${base}/${segment}`.replace(/\/+/g, "/");
}

function collectPageRoutes(routes: AppRouteObject[], parentPath = ""): CollectedPageRoute[] {
    const collected: CollectedPageRoute[] = [];

    for (const route of routes) {
        const segment = route.path ?? "";
        const fullPath = route.index ? parentPath || "/" : joinPath(parentPath, segment);
        const childParentPath = route.index ? parentPath : fullPath;

        if (route.page != null) {
            collected.push({
                page: route.page,
                path: fullPath,
            });
        }

        if (route.children != null) {
            collected.push(...collectPageRoutes(route.children, childParentPath));
        }
    }

    return collected;
}

export function buildRouteExports(routes: AppRouteObject[]) {
    const pageRoutes = collectPageRoutes(routes);

    const paths = {} as Record<AppPage, string>;
    for (const route of pageRoutes) {
        paths[route.page] = route.path;
    }

    return { paths };
}

export function toRouterRoutes(routes: AppRouteObject[]): RouteObject[] {
    return routes.map(({ page, children, handle, ...route }) => ({
        ...route,
        ...(page != null ? { handle: { ...(handle as AppRouteHandle | undefined), page } satisfies AppRouteHandle } : {}),
        ...(children != null ? { children: toRouterRoutes(children) } : {}),
    })) as RouteObject[];
}

export type PagePaths = Record<AppPage, string>;

let matchableRoutes: RouteObject[] | undefined;

function getMatchableRoutes(): RouteObject[] {
    matchableRoutes ??= toRouterRoutes(appRoutes);
    return matchableRoutes;
}

export function isSubRouteOfPage(pathname: string, page: AppPage): boolean {
    const matches = matchRoutes(getMatchableRoutes(), pathname);
    if (matches == null) return false;

    return matches.some(
        (match) => (match.route.handle as AppRouteHandle | undefined)?.page === page,
    );
}

export { appRoutes, paths } from "./router";
