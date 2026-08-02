import type { ApiResponse } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import type {
    Balance,
    InitiateTopUpResponse,
    InitiateWithdrawalResponse,
    Package,
    PaidPackageResponse,
    PaymentResponse,
    PurchaseResponse,
    TopUp,
    Withdrawal,
} from "./types";

const PAYMENTS_ENDPOINT = "/v1/payment/payments";
const PACKAGES_ENDPOINT = "/v1/payment/packages";
const PAID_PACKAGES_ENDPOINT = "/v1/payment/paid-packages";
const PURCHASE_ENDPOINT = "/v1/payment/purchase";
const BALANCE_ENDPOINT = "/v1/payment/balance";
const TOP_UPS_ENDPOINT = "/v1/payment/top-ups";
const WITHDRAWALS_ENDPOINT = "/v1/payment/withdrawals";
const INITIATE_TOP_UP_ENDPOINT = "/v1/payment/initiate-top-up";
const INITIATE_WITHDRAWAL_ENDPOINT = "/v1/payment/initiate-withdrawal";

export function getPayments(): Promise<PaymentResponse[]> {
    return apiClient.get<ApiResponse<PaymentResponse[]>>(PAYMENTS_ENDPOINT).then((res) => res.data ?? []);
}

export function getPackages(): Promise<Package[]> {
    return apiClient.get<ApiResponse<Package[]>>(PACKAGES_ENDPOINT).then((res) => res.data ?? []);
}

export function getPaidPackages(): Promise<PaidPackageResponse> {
    return apiClient
        .get<ApiResponse<PaidPackageResponse>>(PAID_PACKAGES_ENDPOINT)
        .then((res) => res.data ?? { payments: [], largest_tier: 0, can_purchase_trial: false });
}

export function getBalance(): Promise<Balance> {
    return apiClient.get<ApiResponse<Balance>>(BALANCE_ENDPOINT).then((res) => {
        if (!res.data) {
            throw new Error("Balance response missing data");
        }
        return res.data;
    });
}

export function getTopUps(): Promise<TopUp[]> {
    return apiClient.get<ApiResponse<TopUp[]>>(TOP_UPS_ENDPOINT).then((res) => res.data ?? []);
}

export function getWithdrawals(): Promise<Withdrawal[]> {
    return apiClient.get<ApiResponse<Withdrawal[]>>(WITHDRAWALS_ENDPOINT).then((res) => res.data ?? []);
}

export function purchasePackage(packageId: string): Promise<PurchaseResponse> {
    return apiClient.post<ApiResponse<PurchaseResponse>>(PURCHASE_ENDPOINT, { package_id: packageId }).then((res) => {
        if (!res.data) {
            throw new Error("Purchase response missing data");
        }
        return res.data;
    });
}

export function initiateTopUp(amount: number): Promise<void> {
    return apiClient.post<ApiResponse<InitiateTopUpResponse>>(INITIATE_TOP_UP_ENDPOINT, { amount }).then(() => undefined);
}

export function initiateWithdrawal(amount: number): Promise<void> {
    return apiClient
        .post<ApiResponse<InitiateWithdrawalResponse>>(INITIATE_WITHDRAWAL_ENDPOINT, { amount })
        .then(() => undefined);
}
