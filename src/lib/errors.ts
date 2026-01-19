export function handleError(error: unknown): void {
  let msg = "An unexpected error occurred. Please try again.";

  if (error instanceof Error) {
    if (error.name === "ApiTimeoutError") {
      msg = error.message;
    } else {
      msg = "A client-side error occurred.";
    }
  }

  console.error(msg);
  console.error(error);
}
