import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getPayments, getPackages } from "./api";

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
