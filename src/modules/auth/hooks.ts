import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "./store";
import type { User } from "./types";

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadUser = useAuthStore((s) => s.loadUser);
  const logoutFromStore = useAuthStore((s) => s.logout);

  const logout = useCallback(async () => {
    await logoutFromStore();
    navigate("/login", { replace: true });
  }, [logoutFromStore, navigate]);

  return {
    user,
    isLoading,
    refetch: loadUser,
    logout,
  };
}
