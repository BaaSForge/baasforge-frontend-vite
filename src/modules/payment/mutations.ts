import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { purchasePackage } from "./api";

export function usePurchasePackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchasePackage,
    onSuccess: () => {
      // TODO: Invalidate only if the package is realy purchased
      queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAID_PACKAGES });
      queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAYMENTS });
    },
  });
}
