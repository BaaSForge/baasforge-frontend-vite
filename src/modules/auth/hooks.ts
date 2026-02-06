import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useCurrentUserQuery } from "./queries";
import { useLogoutMutation } from "./mutations";
import type { User } from "./types";

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useCurrentUserQuery();
  const { mutateAsync: logoutMutation } = useLogoutMutation();

  const logout = useCallback(async () => {
    await logoutMutation();
    navigate("/login", { replace: true });
  }, [logoutMutation, navigate]);

  return {
    user: user ?? null,
    isLoading,
    refetch,
    logout,
  };
}
