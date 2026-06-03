import { cn } from "@/lib/utils";

export type GeneratingTextShimmerVariant = "blue" | "muted";

export function generatingTextShimmerClassName(variant: GeneratingTextShimmerVariant = "blue", className?: string) {
    return cn(variant === "blue" ? "generating-text-shimmer-blue" : "generating-text-shimmer", className);
}

type GeneratingTextShimmerProps = {
    children: React.ReactNode;
    variant?: GeneratingTextShimmerVariant;
    className?: string;
};

export function GeneratingTextShimmer({ children, variant = "blue", className }: GeneratingTextShimmerProps) {
    return <p className={cn("min-w-0 font-medium leading-snug", generatingTextShimmerClassName(variant), className)}>{children}</p>;
}
