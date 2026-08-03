export interface PaymentResponse {
    id: string;
    amount: number;
    package_title: string | null;
    package_slug: string | null;
    package_price: number | null;
    package_discount: number | null;
    package_is_tiral: boolean;
    is_success: boolean;
    expires_at: string | null;
    cancelled_at: string | null;
}

export interface Package {
    id: string;
    title: string;
    slug: string;
    tier: number;
    description: string | null;
    price: number;
    discount_percent: number | null;
    is_trial: boolean | null;
}

export interface PaymentWithPackage {
    payment: PaymentResponse;
    package: Package;
}

export interface PaidPackageResponse {
    payments: PaymentWithPackage[];
    largest_tier: number;
    can_purchase_trial: boolean;
}

export type BillingPeriod = "monthly" | "annual";

export type PurchaseKind = "package" | "top_up" | "withdraw";

export interface PurchaseResponse {
    package_id: string;
    amount: number;
    billing_period: BillingPeriod;
    checkout_url: string | null;
    session_id: string | null;
    expires_at?: string | null;
}

export interface PurchasePackageInput {
    packageId: string;
    billingPeriod?: BillingPeriod;
}

export interface Balance {
    package_deposits: number;
    top_ups: number;
    deposited: number;
    withdrawn: number;
    balance: number;
    total_usage: number;
}

export interface TopUp {
    id: string;
    user_id: string;
    amount: number;
    gateway_metadata: unknown;
    created_at: string;
}

export interface Withdrawal {
    id: string;
    user_id: string;
    amount: number;
    gateway_metadata: unknown;
    created_at: string;
}

export interface InitiateTopUpResponse {
    id: string;
    amount: number;
    created_at: string;
}

export interface InitiateWithdrawalResponse {
    id: string;
    amount: number;
    created_at: string;
}

export interface SubscriptionReserve {
    min_balance_to_keep: number;
    max_withdraw_without_cancel: number;
    balance: number;
    effective_package_price: number;
    period_usage_cost: number;
}
