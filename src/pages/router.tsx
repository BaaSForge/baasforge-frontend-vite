import { lazy } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { AuthOpenGuard } from "@/modules/auth/components/auth-open-guard";
import { AuthProvider } from "@/modules/auth/context";
import { Loadable } from "./loadable";

const GeneralErrorPage = lazy(() => import("./errors/global/page"));
const NotFoundPage = lazy(() => import("./errors/not-found/page"));
const ServerErrorPage = lazy(() => import("./errors/server/page"));

const DashboardPage = lazy(() => import("./dashboard/page"));
const HomePage = lazy(() => import("./home/page"));
const LoginPage = lazy(() => import("./login/page"));

const RootLayout = () => {
  return (
    <Loadable>
      <Outlet />
    </Loadable>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <GeneralErrorPage />,
    children: [
      {
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            element: (
              <AuthProvider>
                <AuthGuard />
              </AuthProvider>
            ),
            children: [
              {
                path: "dashboard",
                children: [
                  {
                    index: true,
                    element: <DashboardPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        element: (
          <AuthProvider>
            <AuthOpenGuard />
          </AuthProvider>
        ),
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
