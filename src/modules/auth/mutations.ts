import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { deleteTokens as deleteTokensApi, logout as logoutApi } from "./api";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.setQueryData(QueryKeys.AUTH_ME, null);
    },
  });
}

export function useDeleteTokensMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTokensApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.AUTH_TOKENS });
    },
  });
}
