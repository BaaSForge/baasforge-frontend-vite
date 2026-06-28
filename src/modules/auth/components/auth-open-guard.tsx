import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Navigate, Outlet, useSearchParams } from "react-router";
import { useAuth } from "../hooks";
import { resolvePostLoginPath } from "../lib/callback-url";

export function AuthOpenGuard() {
    const { user, isLoading, isError } = useAuth();
    const [searchParams] = useSearchParams();

    if (isLoading) {
        return <LoadingFallback aria-label="Checking authentication" />;
    }

    if (isError) {
        return <Outlet />;
    }

    if (user != null) {
        const to = resolvePostLoginPath(searchParams.get("callback-url"));
        return <Navigate to={to} replace />;
    }

    return <Outlet />;
}
