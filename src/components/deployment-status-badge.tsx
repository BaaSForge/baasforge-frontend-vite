import {
  Hammer,
  Loader,
  BrushCleaning,
  PauseCircle,
  TriangleAlert,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeploymentStatusType } from "@/modules/project/types";

const config: Record<
  DeploymentStatusType | "none",
  { icon?: typeof Hammer | null; label: string; className?: string }
> = {
  up: {
    icon: PlayCircle,
    label: "Up",
    className:
      "text-emerald-700 dark:text-emerald-200",
  },
  failed: {
    icon: TriangleAlert,
    label: "Failed",
    className:
      "text-red-700 dark:text-red-200",
  },
  stopped: {
    icon: PauseCircle,
    label: "Stopped",
    className:
      "text-gray-700 dark:text-gray-200",
  },
  pruned: {
    icon: BrushCleaning,
    label: "Pruned",
    className:
      "text-teal-700 dark:text-teal-200",
  },
  deploying: {
    icon: Loader,
    label: "Deploying",
    className:
      "text-green-700 dark:text-green-200",
  },
  none: {
    icon: null,
    label: "—",
    className:
      "text-gray-700 dark:text-gray-200",
  },
};

export interface DeploymentStatusBadgeProps {
  status?: DeploymentStatusType | null;
  className?: string;
}

export function DeploymentStatusBadge({
  status,
  className,
}: DeploymentStatusBadgeProps) {
  const { icon: Icon, label, className: configClassName } = config[status ?? "none"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 shrink-0 text-sm",
        configClassName,
        className
      )}
      aria-label={label}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      <span>{status ? label : "—"}</span>
    </span>
  );
}
