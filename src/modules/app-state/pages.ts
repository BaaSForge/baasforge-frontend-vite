export const ActivePage = {
    HOME: "HOME",
    LOGIN: "LOGIN",
    DASHBOARD: "DASHBOARD",
    DASHBOARD_PACKAGES: "DASHBOARD_PACKAGES",
    DASHBOARD_PAYMENTS: "DASHBOARD_PAYMENTS",
    DASHBOARD_USAGE: "DASHBOARD_USAGE",
    DASHBOARD_TOKENS: "DASHBOARD_TOKENS",
    PROJECTS: "PROJECTS",
    CREATE_PROJECT: "CREATE_PROJECT",
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

export type PageMatchParams = Record<string, string>;

export type PageRouteMatch = {
    page: ActivePage;
    path: string;
    end?: boolean;
    when?: (pathname: string, params: PageMatchParams) => boolean;
};

export function excludeParam(key: string, ...values: string[]) {
    return (_pathname: string, params: PageMatchParams) => !values.includes(params[key] ?? "");
}

export const PAGE_ROUTE_MATCHES: readonly PageRouteMatch[] = [
    { page: ActivePage.DOCUMENTATION_SHARE, path: "/projects/documentation/:projectId/share/:releaseId" },
    {
        page: ActivePage.RUNTIME_UNITS_RELEASES,
        path: "/dashboard/projects/:projectId/runtimes/:runtimeId/units-releases",
        end: true,
    },
    { page: ActivePage.RUNTIME_DETAIL, path: "/dashboard/projects/:projectId/runtimes/:runtimeId", end: true },
    {
        page: ActivePage.CHAT,
        path: "/dashboard/projects/:projectId/conversations/:conversationId",
        end: true,
    },
    { page: ActivePage.PROJECT_SETTINGS_DELETE, path: "/dashboard/projects/:projectId/settings/delete", end: true },
    { page: ActivePage.PROJECT_SETTINGS_INFO, path: "/dashboard/projects/:projectId/settings/info", end: true },
    { page: ActivePage.NEW_CHAT, path: "/dashboard/projects/:projectId/conversations", end: true },
    {
        page: ActivePage.UNITS_RELEASES_DETAIL,
        path: "/dashboard/projects/:projectId/units-releases/:releaseID",
        end: true,
    },
    { page: ActivePage.UNITS_RELEASES, path: "/dashboard/projects/:projectId/units-releases", end: true },
    { page: ActivePage.RUNTIMES, path: "/dashboard/projects/:projectId/runtimes", end: true },
    { page: ActivePage.RUNTIME_ENV_VARS, path: "/dashboard/projects/:projectId/runtime-env-vars", end: true },
    { page: ActivePage.PROJECT_USAGE, path: "/dashboard/projects/:projectId/usage", end: true },
    { page: ActivePage.CREATE_PROJECT, path: "/dashboard/projects/new", end: true },
    {
        page: ActivePage.PROJECT_OVERVIEW,
        path: "/dashboard/projects/:projectId",
        end: true,
        when: excludeParam("projectId", "new"),
    },
    { page: ActivePage.PROJECTS, path: "/dashboard/projects", end: true },
    { page: ActivePage.DASHBOARD_TOKENS, path: "/dashboard/tokens", end: true },
    { page: ActivePage.DASHBOARD_USAGE, path: "/dashboard/usage", end: true },
    { page: ActivePage.DASHBOARD_PAYMENTS, path: "/dashboard/payments", end: true },
    { page: ActivePage.DASHBOARD_PACKAGES, path: "/dashboard/packages", end: true },
    { page: ActivePage.DASHBOARD, path: "/dashboard", end: true },
    { page: ActivePage.LOGIN, path: "/login", end: true },
    { page: ActivePage.SERVER_ERROR, path: "/500", end: true },
    { page: ActivePage.HOME, path: "/", end: true },
] as const;
