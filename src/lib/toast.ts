// eslint-disable-next-line no-restricted-imports -- sole allowed direct sonner import (shared wrapper)
import { toast as sonnerToast, type ExternalToast } from "sonner";

const DEFAULT_TOAST_OPTIONS = {
    position: "top-center",
    closeButton: true,
} as const satisfies ExternalToast;

function withDefaults(options?: ExternalToast): ExternalToast {
    return { ...options, ...DEFAULT_TOAST_OPTIONS };
}

export const toast = {
    success: (message: Parameters<typeof sonnerToast.success>[0], options?: ExternalToast) =>
        sonnerToast.success(message, withDefaults(options)),
    error: (message: Parameters<typeof sonnerToast.error>[0], options?: ExternalToast) =>
        sonnerToast.error(message, withDefaults(options)),
    warning: (message: Parameters<typeof sonnerToast.warning>[0], options?: ExternalToast) =>
        sonnerToast.warning(message, withDefaults(options)),
    info: (message: Parameters<typeof sonnerToast.info>[0], options?: ExternalToast) =>
        sonnerToast.info(message, withDefaults(options)),
    message: (message: Parameters<typeof sonnerToast.message>[0], options?: ExternalToast) =>
        sonnerToast.message(message, withDefaults(options)),
    loading: (message: Parameters<typeof sonnerToast.loading>[0], options?: ExternalToast) =>
        sonnerToast.loading(message, withDefaults(options)),
    promise: (
        promise: Parameters<typeof sonnerToast.promise>[0],
        options: Parameters<typeof sonnerToast.promise>[1],
    ) => sonnerToast.promise(promise, { ...options, ...DEFAULT_TOAST_OPTIONS }),
    dismiss: sonnerToast.dismiss,
};
