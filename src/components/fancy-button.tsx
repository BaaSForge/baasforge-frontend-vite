"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FancyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function FancyButton({ className, children, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn(
          "bg-[position:0px_0px] bg-gradient-to-r from-blue-300 to-blue-500",
          "hover:from-blue-200 hover:to-blue-400",
          "ring-2 !ring-blue-500/40 text-white transition-[filter,box-shadow]",
          "hover:!text-white hover:!bg-blue-500/90",
          "focus-visible:ring-2 focus-visible:!ring-blue-500",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

export { FancyButton };
