"use client";

import logo256 from "/logo-256x256.png?url";
import logo64 from "/logo-64x64.png?url";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function MarketingLogoSquare({
    className,
    ...props
}: Omit<ComponentPropsWithoutRef<"img">, "src" | "alt" | "draggable">) {
    return (
        <img
            {...props}
            src={logo64}
            srcSet={`${logo64} 64w, ${logo256} 256w`}
            alt="BaaS Forge"
            draggable={false}
            className={cn("aspect-square shrink-0 object-contain", className)}
        />
    );
}
