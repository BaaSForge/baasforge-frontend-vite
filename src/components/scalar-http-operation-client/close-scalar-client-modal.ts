export const SCALAR_CLIENT_EXIT_BUTTON_SELECTOR =
    "body .scalar.scalar-app.z-overlay button.app-exit-button";

export function closeScalarClientModal(): void {
    const button = document.querySelector(SCALAR_CLIENT_EXIT_BUTTON_SELECTOR);
    if (button instanceof HTMLButtonElement) {
        button.click();
    }
}
