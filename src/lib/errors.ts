import { router } from "@/pages/router";
import { toast } from "sonner";

type ErrorWithPackageToPurchase = {
    data?: {
        most_complete_needed_package?: string;
    };
    status?: number;
};

function isApiErrorPayload(x: unknown): x is { error?: { message?: string; code?: string }; message?: string } {
    return typeof x === "object" && x !== null;
}

export function getApiErrorMessage(error: unknown): string {
    if (!isApiErrorPayload(error)) return "Something went wrong.";
    const msg = error.error?.message ?? (typeof error.message === "string" ? error.message : null);
    return msg ?? "Something went wrong.";
}

export function showApiError(error: unknown, statusCode: number): void {
    if (isApiErrorPayload(error) && error.error?.code === "PARSE_ERROR") {
        return;
    }

    const maybeError = error as ErrorWithPackageToPurchase | undefined;
    const needsToPurchasePackage = maybeError?.data?.most_complete_needed_package;

    const errorMessage = getApiErrorMessage(error);

    if (statusCode === 403 && needsToPurchasePackage) {
        const errorTitle = "Purchase required!";

        toast.error(errorTitle, {
            position: "top-center",
            closeButton: true,
            duration: 10_000,
            descriptionClassName: "!text-muted-foreground",
            description: errorMessage,
            action: {
                label: "Go to packages",
                onClick: () => {
                    router.navigate("/dashboard/packages");
                },
            },
        });

        return;
    } else {
        toast.error(errorMessage, { position: "top-center", closeButton: true });
    }
}

export function handleError(error: unknown): void {
    let msg = "An unexpected error occurred. Please try again.";

    if (error instanceof Error) {
        if (error.name === "ApiTimeoutError") {
            msg = error.message;
        } else {
            msg = "A client-side error occurred.";
        }
    } else if (isApiErrorPayload(error)) {
        msg = getApiErrorMessage(error);
    }

    console.error(msg);
    console.error(error);
}
