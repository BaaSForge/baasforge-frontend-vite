import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { AUTH_ERROR_PARAM } from "../constants";
import { useAuth } from "../hooks";
import { buildAuthErrorLoginSearch } from "../lib/callback-url";

export function AuthClosedGuard() {
    const { isLoading, user } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const authError = searchParams.get(AUTH_ERROR_PARAM);

    if (authError) {
        return <Navigate to={`/login?${buildAuthErrorLoginSearch(location.pathname, searchParams)}`} replace />;
    }

    if (isLoading) {
        return <LoadingFallback aria-label="Checking authentication" />;
    }

    if (user == null) {
        throw new Error("Couldn't load user");
    }

    return <Outlet />;
}
