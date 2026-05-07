"use client";

import logo256 from "@public/logo-256x256.png";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function AppLogoSquare({
    className,
    ...props
}: Omit<ComponentPropsWithoutRef<"img">, "src" | "alt" | "draggable">) {
    return (
        <img
            {...props}
            src={logo256}
            alt="BAAL"
            draggable={false}
            className={cn("aspect-square shrink-0 object-contain", className)}
        />
    );
}
