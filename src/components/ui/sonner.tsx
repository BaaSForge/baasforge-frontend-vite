import { useResolvedTheme } from "@/components/theme-provider/hooks";
import { ensureToastPortalContainer, keepToastPortalOnTop } from "@/lib/toast-portal";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
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
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            toastOptions={{
                descriptionClassName: "!text-muted-foreground",
            }}
            {...props}
        />,
        portalContainer,
    );
};

export { Toaster };
