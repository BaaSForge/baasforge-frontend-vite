import { QueryKeys } from "@/constants/query-keys";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useCurrentUserQuery } from "../queries";

export interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    useCurrentUserQuery();

    useEffect(() => {
        apiClient.setOnSessionExpired(() => {
            queryClient.setQueryData(QueryKeys.AUTH_ME, null);
            const { pathname, search } = window.location;
            let callbackUrl: string;
            if (pathname === "/login") {
                const existing = new URLSearchParams(search).get("callback-url");
                if (existing) {
                    try {
                        const decoded = decodeURIComponent(existing);
                        if (decoded.startsWith(window.location.origin)) callbackUrl = decoded;
                        else callbackUrl = `${window.location.origin}/dashboard`;
                    } catch {
                        callbackUrl = `${window.location.origin}/dashboard`;
                    }
                } else {
                    callbackUrl = `${window.location.origin}/dashboard`;
                }
            } else {
                callbackUrl = `${window.location.origin}${pathname}${search}`;
            }
            navigate(`/login?callback-url=${encodeURIComponent(callbackUrl)}`, {
                replace: true,
            });
        });
        return () => apiClient.setOnSessionExpired(undefined);
    }, [navigate, queryClient]);

    return <>{children}</>;
}
