"use client";

import * as React from "react";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Fragment, useMemo } from "react";

export function FreeformMultiCombobox({
    id,
    label,
    placeholder,
    value,
    onValueChange,
    disabled,
    className,
    labelRowClassName,
    chipsClassName,
    chipsEnd,
}: {
    id?: string;
    label: string;
    placeholder: string;
    value: string[];
    onValueChange: (next: string[]) => void;
    disabled?: boolean;
    className?: string;
    labelRowClassName?: string;
    chipsClassName?: string;
    /**
     * Rendered absolutely-positioned at the right end of the chips input (e.g. a loading
     * indicator). When provided, the chips area reserves right padding so chips never sit
     * under it. Render a fixed-size wrapper (e.g. `size-4`) to avoid layout shift when it
     * appears or disappears.
     */
    chipsEnd?: React.ReactNode;
}) {
    const anchor = useComboboxAnchor();
    const items = useMemo(() => [...value].sort((a, b) => a.localeCompare(b)), [value]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        const raw = e.currentTarget.value.trim();
        if (raw.length === 0) return;
        e.preventDefault();
        e.stopPropagation();
        if (value.includes(raw)) {
            e.currentTarget.value = "";
            return;
        }
        onValueChange([...value, raw].sort((a, b) => a.localeCompare(b)));
        e.currentTarget.value = "";
    };

    const labelEl = (
        <Label htmlFor={id} className="text-muted-foreground text-xs font-medium">
            {label}
        </Label>
    );

    return (
        <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
            {labelRowClassName ? <div className={labelRowClassName}>{labelEl}</div> : labelEl}
            <Combobox
                multiple
                autoHighlight
                items={items}
                value={value}
                disabled={disabled}
                onValueChange={(next) => {
                    onValueChange([...(next ?? [])].sort((a, b) => a.localeCompare(b)));
                }}
            >
                <div className="relative w-full min-w-0">
                    <ComboboxChips
                        ref={anchor}
                        className={cn(
                            "h-auto min-h-8 w-full min-w-0 py-1",
                            chipsEnd != null && "pr-9",
                            chipsClassName,
                            disabled && "opacity-50",
                        )}
                    >
                        <ComboboxValue>
                            {(values: string[]) => (
                                <Fragment>
                                    {values.map((v) => (
                                        <ComboboxChip key={v} title={v}>
                                            {v}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput
                                        id={id}
                                        placeholder={placeholder}
                                        className="text-sm placeholder:text-muted-foreground"
                                        onKeyDown={handleInputKeyDown}
                                    />
                                </Fragment>
                            )}
                        </ComboboxValue>
                    </ComboboxChips>
                    {chipsEnd != null ? (
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                            {chipsEnd}
                        </div>
                    ) : null}
                </div>
                <ComboboxContent anchor={anchor} className="w-[var(--anchor-width)]">
                    <ComboboxEmpty>Type and press Enter to add.</ComboboxEmpty>
                    <ComboboxList>
                        {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                                <span className="truncate">{item}</span>
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
