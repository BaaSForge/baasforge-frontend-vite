import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import type { PinTopStatus } from "../types";

type PinTopStatusConfig = {
    Icon: LucideIcon;
    pulseClass: string;
    bgClass: string;
};

export const PIN_TOP_STATUS_CONFIG: Record<PinTopStatus, PinTopStatusConfig> = {
    info: {
        Icon: Info,
        pulseClass: "bg-blue-400 dark:bg-blue-500",
        bgClass: "bg-blue-400 dark:bg-blue-500",
    },
    warning: {
        Icon: AlertTriangle,
        pulseClass: "bg-amber-400 dark:bg-amber-500",
        bgClass: "bg-amber-400 dark:bg-amber-500",
    },
    error: {
        Icon: X,
        pulseClass: "bg-red-400 dark:bg-red-500",
        bgClass: "bg-red-400 dark:bg-red-500",
    },
    success: {
        Icon: Check,
        pulseClass: "bg-emerald-400 dark:bg-emerald-500",
        bgClass: "bg-emerald-400 dark:bg-emerald-500",
    },
};

export function getPinTopStatusConfig(status: PinTopStatus): PinTopStatusConfig {
    return PIN_TOP_STATUS_CONFIG[status];
}
