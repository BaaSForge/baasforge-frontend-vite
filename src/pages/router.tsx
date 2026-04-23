import { AuthLayout, AuthProvider } from "@/modules/auth";
import { AuthClosedGuard } from "@/modules/auth/components/auth-closed-guard";
import { AuthOpenGuard } from "@/modules/auth/components/auth-open-guard";
import { AppShell } from "@/modules/layout";
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import ProjectRuntimesPage from "./dashboard/projects/[projectId]/runtimes/page";
import ProjectRuntimeUnitsAndReleasesPage from "./dashboard/projects/[projectId]/runtimes/[runtimeId]/units-releases/page";
import ProjectUnitsAndReleasesPage from "./dashboard/projects/[projectId]/units-and-releases/page";
import { RootLayout } from "./root-layout";

const GeneralErrorPage = lazy(() => import("./errors/global/page"));
const NotFoundPage = lazy(() => import("./errors/not-found/page"));
const ServerErrorPage = lazy(() => import("./errors/server/page"));

const DashboardPage = lazy(() => import("./dashboard/page"));
const DashboardPackagesPage = lazy(() => import("./dashboard/packages/page"));
const DashboardPaymentsPage = lazy(() => import("./dashboard/payments/page"));
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

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthProvider>
                <RootLayout />
            </AuthProvider>
        ),
        errorElement: <GeneralErrorPage />,
        children: [
            {
                children: [
                    {
                        index: true,
                        element: <HomePage />,
                    },
                    {
                        element: <AuthClosedGuard />,
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
                                                        element: <DashboardPage />,
                                                    },
                                                    {
                                                        path: "packages",
                                                        element: <DashboardPackagesPage />,
                                                    },
                                                    {
                                                        path: "payments",
                                                        element: <DashboardPaymentsPage />,
                                                    },
                                                    {
                                                        path: "tokens",
                                                        element: <DashboardTokensPage />,
                                                    },
                                                    {
                                                        path: "projects",
                                                        element: <ShellLayout />,
                                                        children: [
                                                            {
                                                                index: true,
                                                                element: <ProjectsIndexPage />,
                                                            },
                                                            {
                                                                path: "new",
                                                                element: <CreateProjectPage />,
                                                            },
                                                            {
                                                                path: ":projectId",
                                                                element: <ProjectShellPage />,
                                                                children: [
                                                                    {
                                                                        index: true,
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
                                                                                element: <ProjectSettingsInfoPage />,
                                                                            },
                                                                            {
                                                                                path: "delete",
                                                                                element: <ProjectSettingsDeletePage />,
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        path: "conversations",
                                                                        children: [
                                                                            {
                                                                                index: true,
                                                                                element: <ProjectConversationsPage />,
                                                                            },
                                                                            {
                                                                                path: ":conversationId",
                                                                                element: <ProjectConversationsPage />,
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        path: "units-releases",
                                                                        element: <ProjectUnitsAndReleasesPage />,
                                                                    },
                                                                    {
                                                                        path: "units-releases/:releaseID",
                                                                        element: <ProjectUnitsAndReleasesPage />,
                                                                    },
                                                                    {
                                                                        path: "runtimes",
                                                                        element: <ProjectRuntimesPage />,
                                                                    },
                                                                    {
                                                                        path: "runtimes/:runtimeId/units-releases",
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
                                element: <LoginPage />,
                            },
                        ],
                    },
                ],
            },
            {
                path: "500",
                element: <ServerErrorPage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);

export default router;
