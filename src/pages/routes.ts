import { matchRoutes } from "react-router";
import type { RouteObject } from "react-router";

import { ActivePage, type AppPage } from "./active-page";
import { appRoutes } from "./router";

export { ActivePage, type AppPage } from "./active-page";

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
