"use client";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function parseUnitDependsOnPaths(dependsOn: string | null | undefined): string[] {
    if (dependsOn == null) return [];
    const raw = dependsOn.trim();
    if (raw.length === 0) return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

export function unitDependsOnForDiffText(dependsOn: string | null | undefined): string {
    return parseUnitDependsOnPaths(dependsOn).join("\n");
}

export function hasUnitDependsOn(dependsOn: string | null | undefined): boolean {
    return parseUnitDependsOnPaths(dependsOn).length > 0;
}

export type UnitDependenciesChipsProps = {
    dependsOn: string | null | undefined;
    className?: string;
};

export function UnitDependenciesChips({ dependsOn, className }: UnitDependenciesChipsProps) {
    const paths = useMemo(() => parseUnitDependsOnPaths(dependsOn), [dependsOn]);
    if (paths.length === 0) return null;
    return (
        <div className={cn("flex flex-wrap gap-x-2 gap-y-2", className)}>
            {paths.map((path, i) => (
                <CopyableEntityIdBadge
                    key={`${path}\0${i}`}
                    id={path}
                    title="Click to copy unit path"
                    className="max-w-full shrink-0"
                />
            ))}
        </div>
    );
}
