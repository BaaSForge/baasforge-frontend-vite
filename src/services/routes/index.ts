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

export function isNewConversationUrl(pathname: string): boolean {
    if (!isProjectSelectedUrl(pathname)) return false;

    return matchPath({ path: `${dashboardProjectRoutes.shell}/conversations`, end: true }, pathname) != null;
}

export function isConversationSessionUrl(pathname: string): boolean {
    if (!isProjectSelectedUrl(pathname)) return false;

    return matchPath({ path: `${dashboardProjectRoutes.shell}/conversations/:conversationId`, end: false }, pathname) != null;
}
