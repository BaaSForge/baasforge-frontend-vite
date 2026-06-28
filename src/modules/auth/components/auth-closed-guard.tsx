import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { AUTH_ERROR_PARAM } from "../constants";
import { useAuth } from "../hooks";
import { buildAuthErrorLoginSearch, buildLoginCallbackUrl } from "../lib/callback-url";

export function AuthClosedGuard() {
    const { isLoading, isError, user } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const authError = searchParams.get(AUTH_ERROR_PARAM);

    if (authError) {
        return <Navigate to={`/login?${buildAuthErrorLoginSearch(location.pathname, searchParams)}`} replace />;
    }

    if (isError) {
        throw new Error("Failed to load user data");
    }

    if (isLoading) {
        return <LoadingFallback aria-label="Checking authentication" />;
    }

    if (user == null) {
        const callbackUrl = encodeURIComponent(buildLoginCallbackUrl());
        return <Navigate to={`/login?callback-url=${callbackUrl}`} replace />;
    }

    return <Outlet />;
}
