import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getCurrentUser, getTokens } from "./api";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: QueryKeys.AUTH_ME,
    queryFn: getCurrentUser,
  });
}

export function useGetTokensQuery() {
  return useQuery({
    queryKey: QueryKeys.AUTH_TOKENS,
    queryFn: getTokens,
  });
}
