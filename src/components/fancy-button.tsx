"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

type FancyButtonColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";

type FancyButtonProps = Omit<ButtonProps, "variant"> & {
    color?: FancyButtonColor;
};

const colorClasses: Record<FancyButtonColor, string> = {
    blue: "bg-gradient-to-r from-blue-300 to-blue-500 hover:from-blue-200 hover:to-blue-400 ring-2 !ring-blue-500/40 hover:!bg-blue-500/90 focus-visible:ring-2 focus-visible:!ring-blue-500",
    green: "bg-gradient-to-r from-green-300 to-green-500 hover:from-green-200 hover:to-green-400 ring-2 !ring-green-500/40 hover:!bg-green-500/90 focus-visible:ring-2 focus-visible:!ring-green-500",
    red: "bg-gradient-to-r from-red-300 to-red-500 hover:from-red-200 hover:to-red-400 ring-2 !ring-red-500/40 hover:!bg-red-500/90 focus-visible:ring-2 focus-visible:!ring-red-500",
    yellow: "bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 ring-2 !ring-yellow-500/40 hover:!bg-yellow-500/90 focus-visible:ring-2 focus-visible:!ring-yellow-500",
    purple: "bg-gradient-to-r from-purple-300 to-purple-500 hover:from-purple-200 hover:to-purple-400 ring-2 !ring-purple-500/40 hover:!bg-purple-500/90 focus-visible:ring-2 focus-visible:!ring-purple-500",
    orange: "bg-gradient-to-r from-orange-300 to-orange-500 hover:from-orange-200 hover:to-orange-400 ring-2 !ring-orange-500/40 hover:!bg-orange-500/90 focus-visible:ring-2 focus-visible:!ring-orange-500",
    gray: "bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-200 hover:to-gray-400 ring-2 !ring-gray-500/40 hover:!bg-gray-500/90 focus-visible:ring-2 focus-visible:!ring-gray-500",
};

const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(function FancyButton({ className, children, color = "blue", ...props }, ref) {
    return (
        <Button
            ref={ref}
            variant="default"
            className={cn("bg-[position:0px_0px] text-white transition-[filter,box-shadow] hover:!text-white", colorClasses[color], className)}
            {...props}
        >
            {children}
        </Button>
    );
});

export { FancyButton };
