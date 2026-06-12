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

export function getDefaultUsagePeriod(): { from: Date; to: Date } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
}

function parseIsoDate(raw: string | null): Date | null {
    if (raw == null || raw === "") return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function readUsageSearchParams(searchParams: URLSearchParams): {
    from: Date;
    to: Date;
    page: number;
    pageSize: number;
} {
    const defaults = getDefaultUsagePeriod();
    const from = parseIsoDate(searchParams.get("from")) ?? defaults.from;
    const to = parseIsoDate(searchParams.get("to")) ?? defaults.to;
    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_USAGE_PAGE);
    const pageSizeRaw = parsePositiveInt(searchParams.get("pageSize"), DEFAULT_USAGE_PAGE_SIZE);
    const pageSize = isAllowedUsagePageSize(pageSizeRaw) ? pageSizeRaw : DEFAULT_USAGE_PAGE_SIZE;

    return { from, to, page, pageSize };
}

export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameCalendarDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function periodToDateRange(from: Date, to: Date): { from: Date; to: Date } {
    const fromDay = startOfDay(from);
    const toDayStart = startOfDay(to);

    if (to.getTime() !== toDayStart.getTime()) {
        return { from: fromDay, to: toDayStart };
    }

    const inclusiveEnd = new Date(toDayStart);
    inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
    if (inclusiveEnd.getTime() < fromDay.getTime()) {
        return { from: fromDay, to: toDayStart };
    }

    return { from: fromDay, to: inclusiveEnd };
}

export function dateRangeToPeriod(range: { from?: Date; to?: Date }): { from: Date; to: Date } | null {
    if (!range.from || !range.to) return null;

    const from = startOfDay(range.from);
    let to: Date;

    if (isSameCalendarDay(range.to, new Date())) {
        to = new Date();
    } else {
        to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate() + 1);
    }

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
        next.set("from", patch.from.toISOString());
    }
    if (patch.to != null) {
        next.set("to", patch.to.toISOString());
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
