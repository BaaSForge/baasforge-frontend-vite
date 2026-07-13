import { AuthLayout, AuthProvider } from "@/modules/auth";
import { AuthClosedGuard } from "@/modules/auth/components/auth-closed-guard";
import { AuthOpenGuard } from "@/modules/auth/components/auth-open-guard";
import { AppShell } from "@/modules/layout";
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import ProjectRuntimesPage from "./dashboard/projects/[projectId]/runtimes/page";
import ProjectRuntimeEnvVarsPage from "./dashboard/projects/[projectId]/runtime-env-vars/page";
import ProjectUsagePage from "./dashboard/projects/[projectId]/usage/page";
import ProjectRuntimePage from "./dashboard/projects/[projectId]/runtimes/[runtimeId]/page";
import ProjectRuntimeUnitsAndReleasesPage from "./dashboard/projects/[projectId]/runtimes/[runtimeId]/units-releases/page";
import ProjectUnitsAndReleasesPage from "./dashboard/projects/[projectId]/units-and-releases/page";
import { RootLayout } from "./root-layout";
import { ActivePage, buildRouteExports, toRouterRoutes, type AppRouteObject, type PagePaths } from "./routes";

const GeneralErrorPage = lazy(() => import("./errors/global/page"));
const NotFoundPage = lazy(() => import("./errors/not-found/page"));
const ServerErrorPage = lazy(() => import("./errors/server/page"));

const DashboardPage = lazy(() => import("./dashboard/page"));
const DashboardPackagesPage = lazy(() => import("./dashboard/packages/page"));
const DashboardPaymentsPage = lazy(() => import("./dashboard/payments/page"));
const DashboardOverallUsagePage = lazy(() => import("./dashboard/usage/page"));
const DashboardTokensPage = lazy(() => import("./dashboard/tokens/page"));
const ShellLayout = lazy(() => import("./dashboard/shell-layout"));
const ProjectsIndexPage = lazy(() => import("./dashboard/projects/page"));
const CreateProjectPage = lazy(() => import("./dashboard/projects/new/page"));
const ProjectShellPage = lazy(() => import("./dashboard/projects/[projectId]/page"));
const ProjectOverviewPage = lazy(() => import("./dashboard/projects/[projectId]/project-overview-page"));
const ProjectSettingsLayout = lazy(() => import("./dashboard/projects/[projectId]/settings/layout"));
const ProjectSettingsInfoPage = lazy(() => import("./dashboard/projects/[projectId]/settings/info/page"));
const ProjectSettingsDeletePage = lazy(() => import("./dashboard/projects/[projectId]/settings/delete/page"));
const ProjectConversationsPage = lazy(() => import("./dashboard/projects/[projectId]/conversations/page"));
const HomePage = lazy(() => import("./home/page"));
const LoginPage = lazy(() => import("./login/page"));
const DocumentationSharePage = lazy(() => import("./projects/documentation/[projectId]/share/[releaseId]/page"));

export const appRoutes = [
    {
        path: "/projects/documentation/:projectId/share/:releaseId",
        element: <RootLayout />,
        errorElement: <GeneralErrorPage />,
        children: [
            {
                index: true,
                page: ActivePage.DOCUMENTATION_SHARE,
                element: <DocumentationSharePage />,
            },
        ],
    },
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <GeneralErrorPage />,
        children: [
            {
                children: [
                    {
                        index: true,
                        page: ActivePage.HOME,
                        element: <HomePage />,
                    },
                    {
                        element: (
                            <AuthProvider>
                                <AuthClosedGuard />
                            </AuthProvider>
                        ),
                        children: [
                            {
                                element: <AuthLayout />,
                                children: [
                                    {
                                        element: <AppShell />,
                                        children: [
                                            {
                                                path: "dashboard",
                                                children: [
                                                    {
                                                        index: true,
                                                        page: ActivePage.DASHBOARD,
                                                        element: <DashboardPage />,
                                                    },
                                                    {
                                                        path: "packages",
                                                        page: ActivePage.DASHBOARD_PACKAGES,
                                                        element: <DashboardPackagesPage />,
                                                    },
                                                    {
                                                        path: "payments",
                                                        page: ActivePage.DASHBOARD_PAYMENTS,
                                                        element: <DashboardPaymentsPage />,
                                                    },
                                                    {
                                                        path: "usage",
                                                        page: ActivePage.DASHBOARD_USAGE,
                                                        element: <DashboardOverallUsagePage />,
                                                    },
                                                    {
                                                        path: "tokens",
                                                        page: ActivePage.DASHBOARD_TOKENS,
                                                        element: <DashboardTokensPage />,
                                                    },
                                                    {
                                                        path: "projects",
                                                        element: <ShellLayout />,
                                                        children: [
                                                            {
                                                                index: true,
                                                                page: ActivePage.PROJECTS,
                                                                element: <ProjectsIndexPage />,
                                                            },
                                                            {
                                                                path: "new",
                                                                page: ActivePage.CREATE_PROJECT,
                                                                element: <CreateProjectPage />,
                                                            },
                                                            {
                                                                path: ":projectId",
                                                                page: ActivePage.PROJECT_SHELL,
                                                                element: <ProjectShellPage />,
                                                                children: [
                                                                    {
                                                                        index: true,
                                                                        page: ActivePage.PROJECT_OVERVIEW,
                                                                        element: <ProjectOverviewPage />,
                                                                    },
                                                                    {
                                                                        path: "settings",
                                                                        element: <ProjectSettingsLayout />,
                                                                        children: [
                                                                            {
                                                                                index: true,
                                                                                element: <Navigate to="info" replace />,
                                                                            },
                                                                            {
                                                                                path: "info",
                                                                                page: ActivePage.PROJECT_SETTINGS_INFO,
                                                                                element: <ProjectSettingsInfoPage />,
                                                                            },
                                                                            {
                                                                                path: "delete",
                                                                                page: ActivePage.PROJECT_SETTINGS_DELETE,
                                                                                element: <ProjectSettingsDeletePage />,
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        path: "conversations",
                                                                        children: [
                                                                            {
                                                                                index: true,
                                                                                page: ActivePage.NEW_CHAT,
                                                                                element: <ProjectConversationsPage />,
                                                                            },
                                                                            {
                                                                                path: ":conversationId",
                                                                                page: ActivePage.CHAT,
                                                                                element: <ProjectConversationsPage />,
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        path: "units-releases",
                                                                        page: ActivePage.UNITS_RELEASES,
                                                                        element: <ProjectUnitsAndReleasesPage />,
                                                                    },
                                                                    {
                                                                        path: "units-releases/:releaseID",
                                                                        page: ActivePage.UNITS_RELEASES_DETAIL,
                                                                        element: <ProjectUnitsAndReleasesPage />,
                                                                    },
                                                                    {
                                                                        path: "runtimes",
                                                                        page: ActivePage.RUNTIMES,
                                                                        element: <ProjectRuntimesPage />,
                                                                    },
                                                                    {
                                                                        path: "runtime-env-vars",
                                                                        page: ActivePage.RUNTIME_ENV_VARS,
                                                                        element: <ProjectRuntimeEnvVarsPage />,
                                                                    },
                                                                    {
                                                                        path: "usage",
                                                                        page: ActivePage.PROJECT_USAGE,
                                                                        element: <ProjectUsagePage />,
                                                                    },
                                                                    {
                                                                        path: "runtimes/:runtimeId",
                                                                        page: ActivePage.RUNTIME_DETAIL,
                                                                        element: <ProjectRuntimePage />,
                                                                    },
                                                                    {
                                                                        path: "runtimes/:runtimeId/units-releases",
                                                                        page: ActivePage.RUNTIME_UNITS_RELEASES,
                                                                        element: <ProjectRuntimeUnitsAndReleasesPage />,
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                element: <AuthOpenGuard />,
                children: [
                    {
                        path: "login",
                        children: [
                            {
                                index: true,
                                page: ActivePage.LOGIN,
                                element: <LoginPage />,
                            },
                        ],
                    },
                ],
            },
            {
                path: "500",
                page: ActivePage.SERVER_ERROR,
                element: <ServerErrorPage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
] satisfies AppRouteObject[];

const routeExports = buildRouteExports(appRoutes);

export const paths = routeExports.paths satisfies PagePaths;

export const router = createBrowserRouter(toRouterRoutes(appRoutes));

export default router;
