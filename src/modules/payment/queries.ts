import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getBalance, getPackages, getPaidPackages, getPayments } from "./api";

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
