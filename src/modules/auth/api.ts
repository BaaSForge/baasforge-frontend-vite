import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { User } from "./types";

const AUTH_ME_ENDPOINT = "/v1/auth/me";
const AUTH_LOGOUT_ENDPOINT = "/v1/auth/logout";

export function getCurrentUser(): Promise<User | null> {
  return apiClient
    .get<ApiResponse<User>>(AUTH_ME_ENDPOINT)
    .then((res) => res.data ?? null)
    .catch(() => null);
}

export function logout(): Promise<void> {
  return apiClient.post(AUTH_LOGOUT_ENDPOINT);
}
