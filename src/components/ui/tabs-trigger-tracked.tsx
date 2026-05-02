"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import type { ComponentProps } from "react";

export type TabsTriggerTrackedProps = ComponentProps<typeof TabsTrigger> & {
    onRegisterTrigger: (tabValue: string, node: HTMLButtonElement | null) => void;
};

export function TabsTriggerTracked({ onRegisterTrigger, value, ...props }: TabsTriggerTrackedProps) {
    const key = String(value ?? "");
    return <TabsTrigger {...props} value={value} ref={(node) => onRegisterTrigger(key, node)} />;
}
