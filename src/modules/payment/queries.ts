import { QueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getPackages, getPaidPackages, getPayments } from "./api";

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
