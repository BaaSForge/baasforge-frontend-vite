export function formatUsageCost(amount: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(amount);
}

export function formatUsageKind(kind: string) {
    return kind
        .split(/[._-]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatUsageCostSegment(kind: string) {
    return kind
        .split(/[._-]/)
        .filter((part) => part !== "cost")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatUsageDetails(details: Record<string, unknown>): string {
    if (Object.keys(details).length === 0) return "—";
    try {
        return JSON.stringify(details);
    } catch {
        return "—";
    }
}
