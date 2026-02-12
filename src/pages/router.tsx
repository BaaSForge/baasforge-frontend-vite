import { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { AuthClosedGuard } from "@/modules/auth/components/auth-closed-guard";
import { AuthOpenGuard } from "@/modules/auth/components/auth-open-guard";
import { AuthLayout, AuthProvider } from "@/modules/auth";
import { AppShell } from "@/modules/layout";
import { Loadable } from "./loadable";

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
const ProjectShellPage = lazy(
  () => import("./dashboard/projects/[projectId]/page")
);
const ProjectOverviewPage = lazy(
  () => import("./dashboard/projects/[projectId]/project-overview-page")
);
const ProjectSettingsLayout = lazy(
  () => import("./dashboard/projects/[projectId]/settings/layout")
);
const ProjectSettingsInfoPage = lazy(
  () => import("./dashboard/projects/[projectId]/settings/info/page")
);
const ProjectSettingsDeletePage = lazy(
  () => import("./dashboard/projects/[projectId]/settings/delete/page")
);
const ProjectConversationsPage = lazy(
  () => import("./dashboard/projects/[projectId]/conversations/page")
);
const HomePage = lazy(() => import("./home/page"));
const LoginPage = lazy(() => import("./login/page"));

const RootLayout = () => (
  <Loadable>
    <Outlet />
  </Loadable>
);

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
                                        element: (
                                          <Navigate to="info" replace />
                                        ),
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
