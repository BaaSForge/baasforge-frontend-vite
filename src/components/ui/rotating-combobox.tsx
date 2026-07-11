"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { useListboxTriggerKeyDown } from "@/components/ui/combobox";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type RotatingComboboxOption<T extends string = string> = {
    value: T;
    label: string;
    keywords?: string[];
    icon?: React.ReactNode;
};

export type RotatingComboboxTriggerButtonProps = Omit<React.ComponentPropsWithRef<"button">, "type"> & {
    type: "button";
};

export type RotatingComboboxProps<T extends string> = {
    value: T;
    onValueChange: (value: T) => void;
    options: RotatingComboboxOption<T>[];
    renderTrigger: (props: RotatingComboboxTriggerButtonProps, meta: { open: boolean }) => React.ReactNode;
    /** Overrides the built-in hint text when set. */
    tooltipContent?: React.ReactNode;
    /** Delay (ms) after the list opens before the hint shows. Default 1000. */
    tooltipOpenDelay?: number;
    /** How long (ms) the hint stays visible after it opens. Default 3200. */
    tooltipHintDuration?: number;
    /** Same as `TooltipContent` `side` (shadcn / Radix). Default `top`. */
    tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"];
    /** Same as `PopoverContent` `align` (shadcn / Radix). Default `end`. */
    contentAlign?: React.ComponentProps<typeof PopoverContent>["align"];
    contentClassName?: string;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
};

function nextInOrder<T extends string>(options: RotatingComboboxOption<T>[], current: T): T {
    const values = options.map((o) => o.value);
    const i = values.indexOf(current);
    if (i === -1 || values.length === 0) return current;
    return values[(i + 1) % values.length];
}

export function RotatingCombobox<T extends string>({
    value,
    onValueChange,
    options,
    renderTrigger,
    tooltipContent,
    tooltipOpenDelay = 1000,
    tooltipHintDuration = 3200,
    tooltipSide = "top",
    contentAlign = "end",
    contentClassName,
    disabled,
    onOpenChange,
}: RotatingComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [hintOpen, setHintOpen] = React.useState(false);
    const hintShowTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const hintHideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const commandRef = React.useRef<HTMLDivElement>(null);
    const id = React.useId();
    const triggerId = `${id}-trigger`;
    const listId = `${id}-list`;

    const rotate = React.useCallback(() => {
        onValueChange(nextInOrder(options, value));
    }, [onValueChange, options, value]);

    const handleOpenChange = React.useCallback(
        (next: boolean) => {
            setOpen(next);
            onOpenChange?.(next);
        },
        [onOpenChange],
    );

    const handleTriggerClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        if (disabled) return;
        if (open) {
            e.preventDefault();
            rotate();
            return;
        }
        handleOpenChange(true);
    };

    const focusListElement = React.useCallback(() => {
        commandRef.current?.focus();
    }, []);

    const handleTriggerKeyDown = useListboxTriggerKeyDown({
        disabled: Boolean(disabled),
        open,
        onRequestClose: () => handleOpenChange(false),
        onRequestOpen: () => handleOpenChange(true),
        focusListElement,
    });

    const triggerProps: RotatingComboboxTriggerButtonProps = {
        type: "button",
        ref: triggerRef,
        id: triggerId,
        disabled: Boolean(disabled),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "aria-controls": open ? listId : undefined,
        onClick: handleTriggerClick,
        onKeyDown: handleTriggerKeyDown,
    };

    const isOutsideTrigger = React.useCallback((target: EventTarget | null) => {
        const el = triggerRef.current;
        if (!el || !(target instanceof Node)) return true;
        return !el.contains(target);
    }, []);

    const scrollValueIntoView = React.useCallback(() => {
        const root = commandRef.current;
        if (!root) return;
        const v = String(value);
        const sel = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(v) : v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const item = root.querySelector<HTMLElement>(`[cmdk-item=""][data-value="${sel}"]`);
        item?.scrollIntoView({ block: "nearest" });
    }, [value]);

    React.useLayoutEffect(() => {
        if (!open) return;
        const t = requestAnimationFrame(() => {
            requestAnimationFrame(() => scrollValueIntoView());
        });
        return () => cancelAnimationFrame(t);
    }, [open, value, scrollValueIntoView]);

    React.useEffect(() => {
        if (disabled) return;
        if (hintShowTimerRef.current) clearTimeout(hintShowTimerRef.current);
        if (hintHideTimerRef.current) clearTimeout(hintHideTimerRef.current);
        if (!open) {
            setHintOpen(false);
            return;
        }
        setHintOpen(false);
        hintShowTimerRef.current = setTimeout(() => {
            setHintOpen(true);
            hintHideTimerRef.current = setTimeout(() => setHintOpen(false), tooltipHintDuration);
        }, tooltipOpenDelay);
        return () => {
            if (hintShowTimerRef.current) clearTimeout(hintShowTimerRef.current);
            if (hintHideTimerRef.current) clearTimeout(hintHideTimerRef.current);
        };
    }, [open, disabled, tooltipOpenDelay, tooltipHintDuration]);

    const trigger = renderTrigger(triggerProps, { open });

    const defaultHint = "re-click to switch";
    const tooltipBody = tooltipContent ?? defaultHint;

    const anchor = (
        <TooltipProvider delayDuration={1_000_000} skipDelayDuration={0}>
            <Tooltip open={hintOpen} onOpenChange={(next) => !next && setHintOpen(false)} delayDuration={0}>
                <PopoverAnchor asChild>
                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                </PopoverAnchor>
                <TooltipContent side={tooltipSide} sideOffset={4}>
                    {tooltipBody}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            {anchor}
            <PopoverContent
                align={contentAlign}
                sideOffset={4}
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    queueMicrotask(() => {
                        commandRef.current?.focus();
                        requestAnimationFrame(() => requestAnimationFrame(() => scrollValueIntoView()));
                    });
                }}
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    requestAnimationFrame(() => triggerRef.current?.focus());
                }}
                onPointerDownOutside={(e) => {
                    if (!isOutsideTrigger(e.target)) e.preventDefault();
                }}
                onFocusOutside={(e) => {
                    if (!isOutsideTrigger(e.target)) e.preventDefault();
                }}
                className={cn(
                    "w-[var(--radix-popover-anchor-width)] min-w-[9rem] max-w-[min(100vw-1rem,var(--radix-popover-anchor-width))] p-0 shadow-md",
                    contentClassName,
                )}
            >
                <Command
                    key={String(value)}
                    ref={commandRef}
                    id={listId}
                    role="listbox"
                    tabIndex={0}
                    loop
                    shouldFilter={false}
                    defaultValue={String(value)}
                    aria-labelledby={triggerId}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault();
                            handleOpenChange(false);
                        }
                    }}
                    className="max-h-96 outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                    <CommandList className="p-1">
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                keywords={option.keywords}
                                value={option.value}
                                onSelect={() => {
                                    onValueChange(option.value);
                                    handleOpenChange(false);
                                }}
                                className="relative w-full gap-2 py-1.5 pr-8 pl-2"
                            >
                                {option.icon}
                                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                <span
                                    className="pointer-events-none absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center"
                                    aria-hidden
                                >
                                    <Check
                                        className={cn("size-4", value === option.value ? "opacity-100" : "opacity-0")}
                                    />
                                </span>
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
