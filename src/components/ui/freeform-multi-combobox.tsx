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
    aboveChips,
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
    /** Rendered after the label and before the chips input (e.g. loading indicator). */
    aboveChips?: React.ReactNode;
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
            {aboveChips}
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
                <ComboboxChips
                    ref={anchor}
                    className={cn("h-auto min-h-8 w-full min-w-0 py-1", chipsClassName, disabled && "opacity-50")}
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
