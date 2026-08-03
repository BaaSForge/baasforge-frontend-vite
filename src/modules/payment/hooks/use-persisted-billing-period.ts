import { STORAGE_KEYS } from "@/constants/storage-keys";
import { createSyncedStringLocalStorageStore, useSyncedStringLocalStorageStore } from "@/hooks/synced-local-storage-store";
import type { BillingPeriod } from "../types";

const BILLING_PERIOD_CHANGED_EVENT = "baal:billing-period-changed";

function parseBillingPeriod(raw: string | null): BillingPeriod | null {
    if (raw === "monthly" || raw === "annual") return raw;
    return null;
}

const billingPeriodStore = createSyncedStringLocalStorageStore<BillingPeriod>({
    storageKey: STORAGE_KEYS.PACKAGE_BILLING_PERIOD,
    changedEventName: BILLING_PERIOD_CHANGED_EVENT,
    parse: parseBillingPeriod,
    fallback: "monthly",
    serverSnapshot: "monthly",
});

export function usePersistedBillingPeriod() {
    return useSyncedStringLocalStorageStore(billingPeriodStore);
}
