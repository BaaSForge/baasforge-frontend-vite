import { apiClient } from "@/lib/api-client";
import { QueryKeys } from "@/constants/query-keys";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
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
      const callbackUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      navigate(`/login?callback-url=${encodeURIComponent(callbackUrl)}`, {
        replace: true,
      });
    });
    return () => apiClient.setOnSessionExpired(undefined);
  }, [navigate, queryClient]);

  return <>{children}</>;
}
