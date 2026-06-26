import { matchPath } from "react-router";

import { dashboardProjectRoutes } from "@/pages/routes";

export function getSelectedProjectIdFromPathname(pathname: string): string | undefined {
    const match = matchPath({ path: dashboardProjectRoutes.shell, end: false }, pathname);
    const projectId = match?.params.projectId;

    if (projectId == null || projectId === "new") {
        return undefined;
    }

    return projectId;
}

export function isProjectSelectedUrl(pathname: string): boolean {
    return getSelectedProjectIdFromPathname(pathname) != null;
}
