import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { User, Token } from "./types";

const AUTH_ME_ENDPOINT = "/v1/auth/me";
const AUTH_LOGOUT_ENDPOINT = "/v1/auth/logout";
const AUTH_TOKENS_ENDPOINT = "/v1/auth/tokens";

export function getCurrentUser(): Promise<User | null> {
  return apiClient
    .get<ApiResponse<User>>(AUTH_ME_ENDPOINT)
    .then((res) => res.data ?? null)
    .catch(() => null);
}

export function logout(): Promise<void> {
  return apiClient.post(AUTH_LOGOUT_ENDPOINT);
}

export function getTokens(): Promise<Token[]> {
  return apiClient.get<ApiResponse<Token[]>>(AUTH_TOKENS_ENDPOINT).then((res) => res.data ?? []);
}