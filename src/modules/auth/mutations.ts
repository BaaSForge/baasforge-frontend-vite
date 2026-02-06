import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { logout as logoutApi } from "./api";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.setQueryData(QueryKeys.AUTH_ME, null);
    },
  });
}
