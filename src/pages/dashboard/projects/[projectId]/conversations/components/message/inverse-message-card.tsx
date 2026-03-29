import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type InverseMessageCardProps = React.ComponentProps<typeof Card>;

export function InverseMessageCard({ className, ...props }: InverseMessageCardProps) {
    return (
        <Card
            data-slot="inverse-message-card"
            className={cn(
                "min-w-0 max-w-full gap-0 rounded-2xl rounded-br-md border-0 bg-inverse px-4 py-2.5 text-inverse-foreground shadow-none",
                className,
            )}
            {...props}
        />
    );
}
