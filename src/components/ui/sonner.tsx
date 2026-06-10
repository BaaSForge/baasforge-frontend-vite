import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { ensureToastPortalContainer, keepToastPortalOnTop } from "@/lib/toast-portal";
import { cn } from "@/lib/utils";
import { CheckIcon, InfoIcon, Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastIconVariants = {
    success:
        "border-emerald-500/50 bg-emerald-500/12 text-emerald-600 dark:border-emerald-400/45 dark:bg-emerald-500/18 dark:text-emerald-400",
    error: "border-red-500/50 bg-red-500/12 text-red-600 dark:border-red-400/45 dark:bg-red-500/18 dark:text-red-400",
    info: "border-sky-500/50 bg-sky-500/12 text-sky-600 dark:border-sky-400/45 dark:bg-sky-500/18 dark:text-sky-400",
    warning:
        "border-amber-500/50 bg-amber-500/12 text-amber-600 dark:border-amber-400/45 dark:bg-amber-500/18 dark:text-amber-400",
    loading:
        "border-muted-foreground/35 bg-muted/80 text-muted-foreground dark:border-muted-foreground/30 dark:bg-muted/50",
} as const;

function ToastIcon({
    variant,
    children,
}: {
    variant: keyof typeof toastIconVariants;
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2 [&_svg]:block [&_svg]:size-3",
                toastIconVariants[variant],
            )}
        >
            {children}
        </span>
    );
}

const Toaster = ({
    visibleToasts = 2,
    expand = true,
    duration = 12_000,
    position = "top-center",
    closeButton = true,
    ...props
}: ToasterProps) => {
    const resolved = useResolvedTheme();
    const [portalContainer, setPortalContainer] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const container = ensureToastPortalContainer();
        const stopKeepingOnTop = keepToastPortalOnTop(container);
        setPortalContainer(container);
        return () => {
            stopKeepingOnTop();
            if (container.dataset.slot === "toast-portal") {
                container.remove();
            }
        };
    }, []);

    if (!portalContainer) {
        return null;
    }

    return createPortal(
        <Sonner
            theme={resolved}
            visibleToasts={visibleToasts}
            expand={expand}
            duration={duration}
            position={position}
            closeButton={closeButton}
            className="toaster group"
            icons={{
                success: (
                    <ToastIcon variant="success">
                        <CheckIcon strokeWidth={2.5} />
                    </ToastIcon>
                ),
                info: (
                    <ToastIcon variant="info">
                        <InfoIcon strokeWidth={2.5} />
                    </ToastIcon>
                ),
                warning: (
                    <ToastIcon variant="warning">
                        <TriangleAlertIcon strokeWidth={2.5} />
                    </ToastIcon>
                ),
                error: (
                    <ToastIcon variant="error">
                        <XIcon strokeWidth={2.5} />
                    </ToastIcon>
                ),
                loading: (
                    <ToastIcon variant="loading">
                        <Loader2Icon className="animate-spin" strokeWidth={2.5} />
                    </ToastIcon>
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                    "--toast-icon-margin-start": "0px",
                    "--toast-icon-margin-end": "0px",
                    "--toast-svg-margin-start": "0px",
                    "--toast-svg-margin-end": "0px",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    content: "!ps-2.5",
                    icon: "!size-auto !justify-center !m-0 [&_svg]:!m-0",
                },
                descriptionClassName: "!text-muted-foreground",
            }}
            {...props}
        />,
        portalContainer,
    );
};

export { Toaster };
