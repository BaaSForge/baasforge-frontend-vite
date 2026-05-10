import { Braces } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatSpanDurationMicros(micros: number): string {
    if (!Number.isFinite(micros) || micros < 0) return "—";
    if (micros === 0) return "0";

    const ms = micros / 1000;
    const s = ms / 1000;
    const m = s / 60;
    const h = m / 60;

    const trimTrailingZeros = (n: number, decimals: number) => {
        const t = n.toFixed(decimals).replace(/\.?0+$/, "");
        return t === "" || t === "-" ? "0" : t;
    };

    if (h >= 1) return `${trimTrailingZeros(h, 1)} h`;
    if (m >= 1) return `${trimTrailingZeros(m, 1)} min`;
    if (s >= 1) return `${s >= 10 ? String(Math.round(s)) : trimTrailingZeros(s, 2)} s`;
    if (ms >= 1) return `${ms >= 10 ? String(Math.round(ms)) : trimTrailingZeros(ms, 2)} ms`;
    if (micros >= 1) return `${micros < 10 ? trimTrailingZeros(micros, 2) : String(Math.round(micros))} µs`;
    return "<1 µs";
}

function spanRowFields(span: unknown): { duration: string; durationRawTitle: string | null; spanId: string; tagCount: number } {
    if (span == null || typeof span !== "object" || Array.isArray(span)) {
        return { duration: "—", durationRawTitle: null, spanId: "—", tagCount: 0 };
    }
    const o = span as Record<string, unknown>;
    const dur = o.duration;
    const hasDur = typeof dur === "number" && Number.isFinite(dur);
    const duration = hasDur ? formatSpanDurationMicros(dur) : "—";
    const durationRawTitle = hasDur ? `${dur} µs` : null;
    const sid = o.spanID;
    const spanId = typeof sid === "string" && sid.length > 0 ? sid : "—";
    const tags = o.tags;
    const tagCount = Array.isArray(tags) ? tags.length : 0;
    return { duration, durationRawTitle, spanId, tagCount };
}

export function ReleaseTracesTable({
    spans,
    onOpenSpanModal,
}: {
    spans: unknown[];
    onOpenSpanModal: (span: unknown) => void;
}) {
    return (
        <table className="w-full border-collapse text-left text-sm">
            <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-1.5 pl-2.5 pr-3 font-medium tabular-nums">Duration</th>
                    <th className="min-w-0 py-1.5 pr-3 font-medium">Span ID</th>
                    <th className="w-16 py-1.5 pl-2 pr-3 text-right font-medium">Tags</th>
                    <th className="shrink-0 py-1.5 pl-5 pr-4 text-right font-medium">
                        <span className="sr-only">Details</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                {spans.map((span, index) => {
                    const { duration, durationRawTitle, spanId, tagCount } = spanRowFields(span);
                    const rowKey = spanId !== "—" ? spanId : `span-${index}`;
                    return (
                        <tr
                            key={rowKey}
                            className="cursor-pointer border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/40"
                            onClick={() => onOpenSpanModal(span)}
                        >
                            <td
                                className="py-2 pl-2.5 pr-3 font-mono text-xs tabular-nums align-top"
                                title={durationRawTitle ?? undefined}
                            >
                                {duration}
                            </td>
                            <td
                                className="max-w-[min(12rem,40vw)] truncate py-2 pr-3 font-mono text-xs align-top"
                                title={spanId}
                            >
                                {spanId}
                            </td>
                            <td className="py-2 pl-2 pr-3 text-right text-xs text-muted-foreground align-top tabular-nums">
                                {tagCount}
                            </td>
                            <td className="py-1.5 pl-5 pr-4 text-right align-middle">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    className="ml-auto h-5 min-h-5 gap-1.5 px-1.5 py-0 text-[10px] leading-none font-medium shadow-none [&_svg]:size-2.5"
                                    aria-label="View span details and logs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenSpanModal(span);
                                    }}
                                >
                                    <Braces aria-hidden className="size-2.5 shrink-0 stroke-[1.75]" />
                                    View
                                </Button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
