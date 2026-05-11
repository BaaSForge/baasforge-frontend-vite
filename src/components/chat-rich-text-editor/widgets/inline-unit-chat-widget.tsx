import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project/types";

export type InlineUnitChatWidgetProps = {
    unit: ProjectUnitResponse;
    className?: string;
};

function unitComposerLabel(unit: ProjectUnitResponse): string {
    return `${unit.context_slug}.${unit.module_slug}.${unit.unit_type}.${unit.revision}`;
}

/** Inline pill shown inside the chat composer for a unit reference. */
export function InlineUnitChatWidget({ unit, className }: InlineUnitChatWidgetProps) {
    const label = unitComposerLabel(unit);
    return (
        <span
            contentEditable={false}
            data-inline-unit-id={unit.id}
            className={cn(
                "mx-0.5 inline-flex max-w-[min(100%,22rem)] items-baseline gap-1 rounded-md border border-violet-500/35 bg-violet-500/12 px-1.5 py-0.5 align-baseline text-[0.8125rem] leading-snug text-foreground",
                className,
            )}
        >
            <span className="shrink-0 font-medium text-violet-700 dark:text-violet-300">@unit:</span>
            <span className="min-w-0 truncate font-mono text-[0.75rem]">{label}</span>
        </span>
    );
}
