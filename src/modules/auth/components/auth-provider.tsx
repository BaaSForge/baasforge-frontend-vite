import { QueryKeys } from "@/constants/query-keys";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../api";
import { AUTH_ERROR_PARAM } from "../constants";
import { buildAuthErrorLoginSearch, buildLoginCallbackUrl } from "../lib/callback-url";
import { useCurrentUserQuery } from "../queries";

const SESSION_EXPIRED_DEBOUNCE_MS = 400;

export interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    useCurrentUserQuery();

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let ignoringSessionExpired = false;

        const redirectToLogin = () => {
            queryClient.setQueryData(QueryKeys.AUTH_ME, null);
            const currentParams = new URLSearchParams(window.location.search);

            if (currentParams.has(AUTH_ERROR_PARAM)) {
                navigate(`/login?${buildAuthErrorLoginSearch(window.location.pathname, currentParams)}`, { replace: true });
                return;
            }

            const callbackUrl = buildLoginCallbackUrl();
            navigate(`/login?callback-url=${encodeURIComponent(callbackUrl)}`, {
                replace: true,
            });
        };

        apiClient.setOnSessionExpired(() => {
            if (new URLSearchParams(window.location.search).has(AUTH_ERROR_PARAM)) return;
            if (ignoringSessionExpired) return;

            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                void (async () => {
                    ignoringSessionExpired = true;
                    try {
                        const me = await getCurrentUser();
                        if (me != null) {
                            queryClient.setQueryData(QueryKeys.AUTH_ME, me);
                            return;
                        }
                    } finally {
                        ignoringSessionExpired = false;
                    }
                    redirectToLogin();
                })();
            }, SESSION_EXPIRED_DEBOUNCE_MS);
        });

        return () => {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            apiClient.setOnSessionExpired(undefined);
        };
    }, [navigate, queryClient]);

    return <>{children}</>;
}
