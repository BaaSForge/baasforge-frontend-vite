import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getCurrentUser } from "./api";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: QueryKeys.AUTH_ME,
    queryFn: getCurrentUser,
  });
}
