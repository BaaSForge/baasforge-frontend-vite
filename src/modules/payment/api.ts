import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-client";
import type { PaymentResponse, Package, PaidPackageResponse, PurchaseResponse } from "./types";

const PAYMENTS_ENDPOINT = "/v1/payment/payments";
const PACKAGES_ENDPOINT = "/v1/payment/packages";
const PAID_PACKAGES_ENDPOINT = "/v1/payment/paid-packages";
const PURCHASE_ENDPOINT = "/v1/payment/purchase";

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

export function getPaidPackages(): Promise<PaidPackageResponse> {
  return apiClient
    .get<ApiResponse<PaidPackageResponse>>(PAID_PACKAGES_ENDPOINT)
    .then((res) => res.data ?? { paid_packages: [], largest_tier: 0, can_purchase_trial: false });
}

export function purchasePackage(packageId: number): Promise<PurchaseResponse> {
  return apiClient
    .post<ApiResponse<PurchaseResponse>>(PURCHASE_ENDPOINT, { package_id: packageId })
    .then((res) => {
      if (!res.data) {
        throw new Error("Purchase response missing data");
      }
      return res.data;
    });
}
