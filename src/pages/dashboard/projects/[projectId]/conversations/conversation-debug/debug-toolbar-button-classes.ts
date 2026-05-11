import { cn } from "@/lib/utils";

/** Shared “Debug” toolbar styling (sidebar + conversation composer). */
export const debugToolbarActiveToneClassName = cn(
    "border-0 shadow-none transition-[filter,colors]",
    "!bg-gradient-to-r !from-orange-500 !to-orange-700 text-white hover:!text-white",
    "hover:!from-orange-400 hover:!to-orange-600 hover:!bg-gradient-to-r",
    "[.dark-default_&]:!from-orange-800 [.dark-default_&]:!to-orange-950",
    "[.dark-default_&]:hover:!from-orange-700 [.dark-default_&]:hover:!to-orange-900",
    "[.dark-midnight_&]:!from-orange-600 [.dark-midnight_&]:!to-orange-800",
    "[.dark-midnight_&]:hover:!from-orange-500 [.dark-midnight_&]:hover:!to-orange-700",
    "ring-1 ring-orange-500/22 [.dark-default_&]:ring-orange-300/16 [.dark-midnight_&]:ring-orange-300/22",
    "focus-visible:ring-2 focus-visible:ring-orange-500/35",
);
