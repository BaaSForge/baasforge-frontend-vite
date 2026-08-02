import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

export const SLIDER_THUMB_SIZE_PX = 16;

type SliderMark = {
    value: number;
    className?: string;
};

/** Matches Radix thumb centering so marks align with the thumb center. */
export function getSliderThumbCenterOffsetPx(percent: number, thumbSizePx = SLIDER_THUMB_SIZE_PX) {
    const halfWidth = thumbSizePx / 2;
    return halfWidth - (percent / 50) * halfWidth;
}

export function getSliderValuePercent(value: number, min: number, max: number) {
    if (max <= min) return 0;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    marks,
    ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
    marks?: SliderMark[];
}) {
    const _values = React.useMemo(
        () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
        [value, defaultValue, min, max],
    );

    const range = max - min;

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            className={cn(
                "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
                "[&>span:has([data-slot=slider-thumb])]:relative [&>span:has([data-slot=slider-thumb])]:z-[2]",
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track
                data-slot="slider-track"
                className={cn(
                    "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
                )}
            >
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={cn("bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")}
                />
            </SliderPrimitive.Track>
            {range > 0 &&
                marks?.map((mark) => {
                    const percent = getSliderValuePercent(mark.value, min, max);
                    const offsetPx = getSliderThumbCenterOffsetPx(percent);
                    return (
                        <span
                            key={mark.value}
                            data-slot="slider-mark"
                            aria-hidden
                            className={cn(
                                "bg-amber-500 pointer-events-none absolute top-1/2 z-[1] h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                                mark.className,
                            )}
                            style={{ left: `calc(${percent}% + ${offsetPx}px)` }}
                        />
                    );
                })}
            {Array.from({ length: _values.length }, (_, index) => (
                <SliderPrimitive.Thumb
                    data-slot="slider-thumb"
                    key={index}
                    className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                />
            ))}
        </SliderPrimitive.Root>
    );
}

export { Slider };
