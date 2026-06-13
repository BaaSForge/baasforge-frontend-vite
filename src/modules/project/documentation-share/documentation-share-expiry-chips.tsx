"use client";

import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { DOCUMENTATION_SHARE_EXPIRY_PRESETS } from "./documentation-share-expiry";
import type { DocumentationShareExpiryPresetId } from "./types";

type DocumentationShareExpiryChipsProps = {
    value: DocumentationShareExpiryPresetId;
    onChange: (presetId: DocumentationShareExpiryPresetId) => void;
    className?: string;
    disabled?: boolean;
    mode: "generate" | "regenerate";
};

const COPY = {
    generate: {
        title: "Link expiry",
        description: "When the new link should stop working.",
    },
    regenerate: {
        title: "New link expiry",
        description: "Used when you re-generate. The current link is revoked and replaced.",
    },
} as const;

export function DocumentationShareExpiryChips({
    value,
    onChange,
    className,
    disabled,
    mode,
}: DocumentationShareExpiryChipsProps) {
    const { title, description } = COPY[mode];

    return (
        <Field className={className}>
            <FieldTitle>{title}</FieldTitle>
            <FieldDescription>{description}</FieldDescription>
            <div className="flex flex-wrap gap-1.5">
                {DOCUMENTATION_SHARE_EXPIRY_PRESETS.map(({ id, label }) => {
                    const isActive = value === id;

                    return (
                        <Badge
                            key={id}
                            asChild
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                                "rounded-full px-2.5 py-1",
                                disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
                                !disabled && !isActive && "hover:bg-accent hover:text-accent-foreground",
                                isActive && "shadow-sm ring-2 ring-primary/25",
                            )}
                        >
                            <button
                                type="button"
                                aria-pressed={isActive}
                                disabled={disabled}
                                onClick={() => onChange(id)}
                            >
                                {label}
                            </button>
                        </Badge>
                    );
                })}
            </div>
        </Field>
    );
}
