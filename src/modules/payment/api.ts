import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { PaymentResponse, Package } from "./types";

const PAYMENTS_ENDPOINT = "/v1/payment/payments";
const PACKAGES_ENDPOINT = "/v1/payment/packages";

export function getPayments(): Promise<PaymentResponse[]> {
  return apiClient
    .get<ApiResponse<PaymentResponse[]>>(PAYMENTS_ENDPOINT)
    .then((res) => res.data ?? []);
}

export function getPackages(): Promise<Package[]> {
  return apiClient
    .get<ApiResponse<Package[]>>(PACKAGES_ENDPOINT)
    .then((res) => res.data ?? []);
}
