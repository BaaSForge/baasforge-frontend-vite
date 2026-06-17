import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLogoutMutation } from "./mutations";
import { useCurrentUserQuery } from "./queries";
import type { User } from "./types";
import { userFromMe } from "./types";

export interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
    logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: me, isLoading, refetch } = useCurrentUserQuery();
    const { mutateAsync: logoutMutation } = useLogoutMutation();

    const logout = useCallback(async () => {
        await logoutMutation();
        const returnUrl = `${window.location.origin}${location.pathname}${location.search}`;
        navigate(`/login?callback-url=${encodeURIComponent(returnUrl)}`, {
            replace: true,
        });
    }, [logoutMutation, navigate, location.pathname, location.search]);

    return {
        user: me != null ? userFromMe(me) : null,
        isLoading,
        refetch,
        logout,
    };
}
