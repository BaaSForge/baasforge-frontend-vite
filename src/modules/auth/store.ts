import { create } from "zustand";
import { getCurrentUser, logout as logoutApi } from "./api";
import type { User } from "./types";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  loadUser: async () => {
    set((s) => (s.isLoading ? s : { ...s, isLoading: true }));
    const user = await getCurrentUser();
    set({ user, isLoading: false });
  },

  logout: async () => {
    try {
      await logoutApi();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
