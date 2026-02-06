import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { User } from "./types";

const AUTH_ME_ENDPOINT = "/v1/auth/me";
const AUTH_LOGOUT_ENDPOINT = "/v1/auth/logout";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await apiClient.get<ApiResponse<User>>(AUTH_ME_ENDPOINT);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH_LOGOUT_ENDPOINT);
}
