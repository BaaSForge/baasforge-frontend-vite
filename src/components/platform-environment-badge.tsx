import { Hammer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformEnvironmentType } from "@/modules/project/types";

const config: Record<
  PlatformEnvironmentType,
  { icon: typeof Hammer; label: string; className?: string }
> = {
  stage: {
    icon: Hammer,
    label: "Stage",
    className:
      "text-yellow-700 dark:text-yellow-200",
  },
  prod: {
    icon: ShieldCheck,
    label: "Production",
    className:
      "text-blue-700 dark:text-blue-200",
  },
};

export interface PlatformEnvironmentBadgeProps {
  environment: PlatformEnvironmentType;
  className?: string;
}

export function PlatformEnvironmentBadge({
  environment,
  className,
}: PlatformEnvironmentBadgeProps) {
  const { icon: Icon, label, className: envClassName } = config[environment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm shrink-0",
        envClassName,
        className
      )}
      aria-label={label}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
