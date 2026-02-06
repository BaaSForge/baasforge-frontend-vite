import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks";

export function AuthGuard() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback aria-label="Checking authentication" />;
  }

  if (user == null) {
    const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const encodedCallbackUrl = encodeURIComponent(currentUrl);
    return <Navigate to={`/login?callback-url=${encodedCallbackUrl}`} replace />;
  }

  return <Outlet />;
}
