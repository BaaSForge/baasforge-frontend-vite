import type { BillingPeriod, Package } from "../types";

/** Fraction off for annual billing (matches backend `ANNUAL_BILLING_DISCOUNT`). */
export const ANNUAL_BILLING_DISCOUNT = 0.2;

export const ANNUAL_BILLING_DISCOUNT_PERCENT = Math.round(ANNUAL_BILLING_DISCOUNT * 100);

/** Sale price charged and credited to balance (pay $X → get $X credit; not list price). */
export function packageSubscriptionAmount(
    listMonthlyPrice: number,
    discountPercent: number | null | undefined,
    billingPeriod: BillingPeriod,
): number {
    const discount = Math.min(Math.max(discountPercent ?? 0, 0), 100) / 100;
    const discountedMonthly = listMonthlyPrice * (1 - discount);
    if (billingPeriod === "annual") {
        return discountedMonthly * 12 * (1 - ANNUAL_BILLING_DISCOUNT);
    }
    return discountedMonthly;
}

export function packageAmountForBillingPeriod(pkg: Package, billingPeriod: BillingPeriod): number {
    return packageSubscriptionAmount(pkg.price, pkg.discount_percent, billingPeriod);
}
