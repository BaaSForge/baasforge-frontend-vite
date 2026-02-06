import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context";

export function AuthOpenGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback aria-label="Checking authentication" />;
  }

  if (user != null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
