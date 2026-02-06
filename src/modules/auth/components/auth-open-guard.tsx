import { Navigate, Outlet } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "../context";

export function AuthOpenGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Checking authentication">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (user != null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
