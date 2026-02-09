import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { User, Token, GetTokensFilter } from "./types";

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

export function getTokens(filter: GetTokensFilter): Promise<Token[]> {
  const params = new URLSearchParams({
    revoked: String(filter.revoked),
    type: filter.type,
  });
  const url = `${AUTH_TOKENS_ENDPOINT}?${params.toString()}`;
  return apiClient.get<ApiResponse<Token[]>>(url).then((res) => res.data ?? []);
}

export function deleteTokens(tokenIds: number[]): Promise<void> {
  return apiClient
    .delete<ApiResponse<void>>(AUTH_TOKENS_ENDPOINT, {
      body: JSON.stringify({ token_ids: tokenIds }),
    })
    .then(() => undefined);
}