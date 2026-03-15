import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getTokens } from "./api";
import type { GetTokensFilter } from "./types";
import { TokenType } from "./types";

export function useCurrentUserQuery() {
    return useQuery({
        queryKey: QueryKeys.AUTH_ME,
        queryFn: getCurrentUser,
    });
}

const defaultTokensFilter: GetTokensFilter = {
    revoked: false,
    type: TokenType.REFRESH,
};

export function useGetTokensQuery(filter: GetTokensFilter = defaultTokensFilter) {
    return useQuery({
        queryKey: [...QueryKeys.AUTH_TOKENS, filter],
        queryFn: () => getTokens(filter),
    });
}
