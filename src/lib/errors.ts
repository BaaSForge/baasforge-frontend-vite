import { toast } from "sonner";

function isApiErrorPayload(x: unknown): x is { error?: { message?: string }; message?: string } {
  return typeof x === "object" && x !== null;
}

export function getApiErrorMessage(error: unknown): string {
  if (!isApiErrorPayload(error)) return "Something went wrong.";
  const msg = error.error?.message ?? (typeof error.message === "string" ? error.message : null);
  return msg ?? "Something went wrong.";
}

export function showApiError(error: unknown): void {
  toast.error(getApiErrorMessage(error), { position: "top-center" });
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
