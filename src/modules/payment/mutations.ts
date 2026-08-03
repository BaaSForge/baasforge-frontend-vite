import { QueryKeys } from "@/constants/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { initiateTopUp, initiateWithdrawal, purchasePackage } from "./api";

export function usePurchasePackageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: purchasePackage,
        onSuccess: (data) => {
            if (data.checkout_url == null) {
                queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAID_PACKAGES });
                queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAYMENTS });
                queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_BALANCE });
            }
        },
    });
}

export function useInitiateTopUpMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: initiateTopUp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_BALANCE });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_TOP_UPS });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_SUBSCRIPTION_RESERVE });
        },
    });
}

export function useInitiateWithdrawalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: initiateWithdrawal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_BALANCE });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_WITHDRAWALS });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_SUBSCRIPTION_RESERVE });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAID_PACKAGES });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PACKAGES });
            queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAYMENTS });
        },
    });
}
