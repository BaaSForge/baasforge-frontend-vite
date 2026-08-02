import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import {
    getBalance,
    getPackages,
    getPaidPackages,
    getPayments,
    getSubscriptionReserve,
    getTopUps,
    getWithdrawals,
} from "./api";

const BALANCE_REFETCH_INTERVAL_MS = 15 * 60 * 1000;

export function usePaymentsQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_PAYMENTS,
        queryFn: getPayments,
    });
}

export function usePackagesQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_PACKAGES,
        queryFn: getPackages,
    });
}

export function usePaidPackagesQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_PAID_PACKAGES,
        queryFn: getPaidPackages,
    });
}

export function useBalanceQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_BALANCE,
        queryFn: getBalance,
        refetchInterval: BALANCE_REFETCH_INTERVAL_MS,
    });
}

export function useTopUpsQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_TOP_UPS,
        queryFn: getTopUps,
        refetchInterval: BALANCE_REFETCH_INTERVAL_MS,
    });
}

export function useWithdrawalsQuery() {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_WITHDRAWALS,
        queryFn: getWithdrawals,
        refetchInterval: BALANCE_REFETCH_INTERVAL_MS,
    });
}

export function useSubscriptionReserveQuery(enabled = true) {
    return useQuery({
        queryKey: QueryKeys.PAYMENT_SUBSCRIPTION_RESERVE,
        queryFn: getSubscriptionReserve,
        enabled,
    });
}
