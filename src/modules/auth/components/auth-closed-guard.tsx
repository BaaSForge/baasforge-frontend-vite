import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Outlet } from "react-router";
import { useAuth } from "../hooks";

export function AuthClosedGuard() {
    const { isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingFallback aria-label="Checking authentication" />;
    }

    if (user == null) {
        throw new Error("Couldn't load user");
    }

    return <Outlet />;
}
