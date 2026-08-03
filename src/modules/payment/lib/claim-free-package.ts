import type { PurchasePackageInput, PurchaseResponse } from "../types";

type PurchaseMutate = (
    input: PurchasePackageInput,
    options?: {
        onSuccess?: (data: PurchaseResponse) => void;
        onError?: (error: Error) => void;
    },
) => void;

type ClaimFreePackageOptions = {
    onSuccess?: (data: PurchaseResponse) => void;
    onError?: (error: Error) => void;
};

export function claimFreePackage(
    mutate: PurchaseMutate,
    input: PurchasePackageInput,
    options?: ClaimFreePackageOptions,
) {
    mutate(input, {
        onSuccess: (data) => {
            if (data.checkout_url != null) {
                options?.onError?.(new Error("Expected a free package claim, but checkout was required"));
                return;
            }
            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error instanceof Error ? error : new Error("Failed to claim free package"));
        },
    });
}
