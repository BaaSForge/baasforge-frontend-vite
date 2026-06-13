export const DEFAULT_USAGE_PAGE = 1;
export const DEFAULT_USAGE_PAGE_SIZE = 20;

const PAGE_SIZES = [10, 20, 50, 100] as const;

export function isAllowedUsagePageSize(n: number): n is (typeof PAGE_SIZES)[number] {
    return PAGE_SIZES.includes(n as (typeof PAGE_SIZES)[number]);
}

export function parsePositiveInt(raw: string | null, fallback: number): number {
    if (raw == null || raw === "") return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/** Exclusive upper bound for API `to` — includes the full selected calendar day. */
export function endOfDayExclusive(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function getDefaultUsagePeriod(): { from: Date; to: Date } {
    const now = new Date();
    return {
        from: startOfMonth(now),
        to: startOfNextMonth(now),
    };
}

export function isDefaultUsagePeriod(from: Date, to: Date): boolean {
    const { from: defaultFrom, to: defaultTo } = getDefaultUsagePeriod();
    return from.getTime() === defaultFrom.getTime() && to.getTime() === defaultTo.getTime();
}

export type UsagePeriodPresetId = "day" | "week" | "month" | "two-months";

const USAGE_PERIOD_PRESET_DAYS: Record<UsagePeriodPresetId, number> = {
    day: 1,
    week: 7,
    month: 30,
    "two-months": 60,
};

export const USAGE_PERIOD_PRESETS: { id: UsagePeriodPresetId; label: string }[] = [
    { id: "day", label: "Last day" },
    { id: "week", label: "Last week" },
    { id: "month", label: "Last month" },
    { id: "two-months", label: "Last two months" },
];

export function getUsagePeriodPreset(id: UsagePeriodPresetId): { from: Date; to: Date } {
    const now = new Date();
    const to = endOfDayExclusive(now);
    const from = startOfDay(now);
    from.setDate(from.getDate() - (USAGE_PERIOD_PRESET_DAYS[id] - 1));
    return { from, to };
}

export function isSameUsagePeriod(a: { from: Date; to: Date }, b: { from: Date; to: Date }): boolean {
    return a.from.getTime() === b.from.getTime() && a.to.getTime() === b.to.getTime();
}

function parseIsoDate(raw: string | null): Date | null {
    if (raw == null || raw === "") return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function normalizePeriodBounds(from: Date, to: Date): { from: Date; to: Date } {
    const normalizedFrom = startOfDay(from);
    const toDayStart = startOfDay(to);
    const normalizedTo = to.getTime() === toDayStart.getTime() ? to : endOfDayExclusive(to);

    if (normalizedFrom >= normalizedTo) {
        return getDefaultUsagePeriod();
    }

    return { from: normalizedFrom, to: normalizedTo };
}

export function readUsageSearchParams(searchParams: URLSearchParams): {
    from: Date;
    to: Date;
    page: number;
    pageSize: number;
} {
    const defaults = getDefaultUsagePeriod();
    const parsedFrom = parseIsoDate(searchParams.get("from")) ?? defaults.from;
    const parsedTo = parseIsoDate(searchParams.get("to")) ?? defaults.to;
    const { from, to } = normalizePeriodBounds(parsedFrom, parsedTo);
    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_USAGE_PAGE);
    const pageSizeRaw = parsePositiveInt(searchParams.get("pageSize"), DEFAULT_USAGE_PAGE_SIZE);
    const pageSize = isAllowedUsagePageSize(pageSizeRaw) ? pageSizeRaw : DEFAULT_USAGE_PAGE_SIZE;

    return { from, to, page, pageSize };
}

/** Map stored API bounds (exclusive `to`) to inclusive calendar days for the picker. */
export function periodToDateRange(from: Date, to: Date): { from: Date; to: Date } {
    const fromDay = startOfDay(from);
    const inclusiveEnd = new Date(startOfDay(to));
    inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
    return { from: fromDay, to: inclusiveEnd };
}

export function dateRangeToPeriod(range: { from?: Date; to?: Date }): { from: Date; to: Date } | null {
    if (!range.from || !range.to) return null;

    const from = startOfDay(range.from);
    const to = endOfDayExclusive(range.to);

    if (from >= to) return null;
    return { from, to };
}

export function mergeUsageSearchParams(
    prev: URLSearchParams,
    patch: Partial<{
        from: Date;
        to: Date;
        page: number;
        pageSize: number;
    }>,
): URLSearchParams {
    const next = new URLSearchParams(prev);
    const defaults = getDefaultUsagePeriod();

    if (patch.from != null) {
        next.set("from", startOfDay(patch.from).toISOString());
    }
    if (patch.to != null) {
        const toDayStart = startOfDay(patch.to);
        const exclusiveTo = patch.to.getTime() === toDayStart.getTime() ? patch.to : endOfDayExclusive(patch.to);
        next.set("to", exclusiveTo.toISOString());
    }

    if (patch.page != null) {
        if (patch.page === DEFAULT_USAGE_PAGE) next.delete("page");
        else next.set("page", String(patch.page));
    }

    if (patch.pageSize != null) {
        if (patch.pageSize === DEFAULT_USAGE_PAGE_SIZE) next.delete("pageSize");
        else next.set("pageSize", String(patch.pageSize));
    }

    if (!next.has("from")) {
        next.set("from", defaults.from.toISOString());
    }
    if (!next.has("to")) {
        next.set("to", defaults.to.toISOString());
    }

    return next;
}
