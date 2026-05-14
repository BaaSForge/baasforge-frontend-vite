import { cn } from "@/lib/utils";
import type { ProjectUnitResponse } from "@/modules/project/types";
import type { NodeKey } from "lexical";
import { ComposerInlineWidgetShell } from "./composer-inline-widget-shell";

export type InlineUnitChatWidgetProps = {
    nodeKey?: NodeKey;
    unit: ProjectUnitResponse;
    className?: string;
};

function unitComposerLabel(unit: ProjectUnitResponse): string {
    return `${unit.context_slug}.${unit.module_slug}.${unit.unit_type}.${unit.revision}`;
}

function UnitPillContent({ unit }: { unit: ProjectUnitResponse }) {
    const label = unitComposerLabel(unit);
    return (
        <>
            <span className="shrink-0 font-medium text-violet-700 dark:text-violet-300">@unit:</span>
            <span className="min-w-0 truncate font-mono text-[0.75rem]">{label}</span>
        </>
    );
}

const pillClassName =
    "mx-0.5 inline-flex max-w-[min(100%,22rem)] items-baseline gap-1 rounded-md border border-violet-500/35 bg-violet-500/12 px-1.5 py-0.5 align-baseline text-[0.8125rem] leading-snug text-foreground";

export function InlineUnitChatWidget({ nodeKey, unit, className }: InlineUnitChatWidgetProps) {
    if (nodeKey != null) {
        return (
            <ComposerInlineWidgetShell
                nodeKey={nodeKey}
                data-inline-unit-id={unit.id}
                className={cn(pillClassName, className)}
            >
                <UnitPillContent unit={unit} />
            </ComposerInlineWidgetShell>
        );
    }
    return (
        <span contentEditable={false} data-inline-unit-id={unit.id} className={cn(pillClassName, className)}>
            <UnitPillContent unit={unit} />
        </span>
    );
}
