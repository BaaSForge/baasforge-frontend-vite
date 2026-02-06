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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
