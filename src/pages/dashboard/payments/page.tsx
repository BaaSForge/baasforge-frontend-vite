"use client";

import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SectionTitle } from "@/components/section-title";
import { TimeLeftLabel } from "@/components/time-left-label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePreferStackedLayout } from "@/hooks/use-prefer-stacked-layout";
import { cn, formatPrice } from "@/lib/utils";
import type { Balance, TopUp, Withdrawal } from "@/modules/payment";
import { useBalanceQuery, usePaymentsQuery, useTopUpsQuery, useWithdrawalsQuery } from "@/modules/payment";
import { TopUpModal } from "@/modules/payment/components/top-up-modal";
import { TrialBadge } from "@/modules/payment/components/trial-badge";
import { WithdrawModal } from "@/modules/payment/components/withdraw-modal";
import {
    usePageTitleBoxHeight,
    useStickyBreadcrumbBarHeight,
    useStickyBreadcrumbBarVisible,
} from "@/stores/breadcrumb";
import { formatDateTime, getTimeLeft, type TimeLeft } from "@/utils/time";
import { ArrowUpRight, BanknoteArrowDown, BanknoteArrowUp, Info, Package, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function getExpiryBadgeVariant(info: TimeLeft): "destructive" | "secondary" | null {
    if (info.type === "no_date" || info.type === "expired") return "destructive";
    if (info.type === "active") {
        if (info.days >= 1) return info.days <= 3 ? "destructive" : "secondary";
        return "destructive";
    }
    return null;
}

const BALANCE_BREAKDOWN: { key: keyof Balance; label: string }[] = [
    { key: "package_deposits", label: "Package deposits" },
    { key: "top_ups", label: "Top ups" },
    { key: "withdrawn", label: "Withdrawn" },
];

function BalanceSummaryPanel({ balance, isLoading, isError }: { balance?: Balance; isLoading: boolean; isError: boolean }) {
    if (isLoading) {
        return <ContentLoadingState size="compact" label="Loading balance…" />;
    }

    if (isError || !balance) {
        return <ContentErrorState size="compact" title="Failed to load balance." subtitle="Try refreshing the page." />;
    }

    const isNegative = balance.balance < 0;

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <SectionTitle className="mb-0 text-base text-foreground">Balance</SectionTitle>
                <p
                    className={cn(
                        "text-base font-semibold tracking-tight tabular-nums",
                        isNegative && "text-destructive",
                    )}
                >
                    {formatPrice(balance.balance)}
                </p>
            </div>

            <div className="divide-y border-t">
                {BALANCE_BREAKDOWN.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4 py-2">
                        <span className="text-muted-foreground text-sm">{label}</span>
                        <span className="text-sm font-medium tabular-nums">{formatPrice(balance[key])}</span>
                    </div>
                ))}
                <div className="flex items-center justify-between gap-4 py-2">
                    <Link
                        to="/dashboard/usage"
                        className="text-foreground/80 hover:text-foreground inline-flex items-center gap-0.5 text-sm font-medium underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground/50"
                    >
                        Total usage
                        <ArrowUpRight className="size-3.5 shrink-0 opacity-70" />
                    </Link>
                    <span className="text-sm font-medium tabular-nums">{formatPrice(balance.total_usage)}</span>
                </div>
            </div>
        </div>
    );
}

function AmountTimeTable({
    rows,
    isLoading,
    emptyLabel,
}: {
    rows: Array<TopUp | Withdrawal>;
    isLoading: boolean;
    emptyLabel: string;
}) {
    if (isLoading) {
        return <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>;
    }

    if (rows.length === 0) {
        return <p className="text-muted-foreground py-8 text-center text-sm">{emptyLabel}</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className="font-medium tabular-nums">{formatPrice(row.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDateTime(row.created_at)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function DashboardPaymentsPage() {
    const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery();
    const { data: topUps = [], isLoading: topUpsLoading } = useTopUpsQuery();
    const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawalsQuery();
    const { data: balance, isLoading: balanceLoading, isError: balanceError } = useBalanceQuery();
    const stackedLayout = usePreferStackedLayout();
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const pageTitleBoxHeight = usePageTitleBoxHeight();
    const balanceStickyTop = (stickyBarVisible ? stickyBarHeight : 0) + pageTitleBoxHeight + 16;
    const [topUpOpen, setTopUpOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    return (
        <>
            <PageTitleBox
                title="Balance & payments"
                tools={
                    <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setWithdrawOpen(true)}>
                            <BanknoteArrowDown className="size-4" />
                            Withdraw
                        </Button>
                        <Button type="button" size="sm" onClick={() => setTopUpOpen(true)}>
                            <BanknoteArrowUp className="size-4" />
                            Top up
                        </Button>
                    </div>
                }
            />
            <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
            <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
            <Container className="flex flex-col gap-4">
                <Alert className="items-start">
                    <Info />
                    <AlertTitle>Prefer packages over top-ups</AlertTitle>
                    <AlertDescription className="gap-3">
                        <p>
                            Packages (subscriptions) include discounts on compute, storage, and AI token usage (input and
                            output), so they usually cost less than topping up. Use a top-up when your package credit runs
                            out and you only need more balance until the next billing period (monthly or annual). Higher
                            tiers unlock larger discounts and lower usage costs. See{" "}
                            <Link
                                to="/docs/security-billing/costs"
                                reloadDocument
                                className="text-foreground font-medium underline underline-offset-4"
                            >
                                Costs &amp; Billing
                            </Link>{" "}
                            for details.
                        </p>
                        <Button type="button" size="sm" variant="outline" asChild>
                            <Link to="/dashboard/packages">
                                <Package className="size-4" />
                                View packages
                            </Link>
                        </Button>
                    </AlertDescription>
                </Alert>

                <Alert className="items-start border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50">
                    <TriangleAlert className="text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="line-clamp-none text-amber-950 dark:text-amber-50">
                        Credit stays; discounts need an active package
                    </AlertTitle>
                    <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                        <p>
                            Package credit remains in your balance after the package period ends. Usage discounts apply
                            only while you have a non-expired package.
                        </p>
                    </AlertDescription>
                </Alert>

                <div className={cn("flex gap-4", stackedLayout ? "flex-col" : "flex-row items-start")}>
                    <div
                        className={cn(
                            "flex min-w-0 flex-col rounded-xl border bg-card p-4",
                            stackedLayout ? "w-full" : "sticky w-[280px] shrink-0 self-start",
                        )}
                        style={stackedLayout ? undefined : { top: balanceStickyTop }}
                    >
                        <BalanceSummaryPanel balance={balance} isLoading={balanceLoading} isError={balanceError} />
                    </div>

                    <div className={cn("flex min-w-0 flex-col gap-4", stackedLayout ? "w-full" : "min-w-0 flex-1")}>
                        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4">
                            <SectionTitle className="mb-0 flex items-center gap-2 text-foreground">
                                <Package className="size-4 shrink-0" />
                                Package deposits
                            </SectionTitle>
                            <div className="overflow-x-auto">
                                {paymentsLoading ? (
                                    <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
                                ) : payments.length === 0 ? (
                                    <p className="text-muted-foreground py-8 text-center text-sm">No package deposits found.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Package</TableHead>
                                                <TableHead>Trial</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Expires</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => {
                                                const expiry = getTimeLeft(payment.expires_at);
                                                const expireTooltip = payment.expires_at
                                                    ? `Expires at: ${formatDateTime(payment.expires_at)}`
                                                    : "";
                                                const variant = getExpiryBadgeVariant(expiry);
                                                return (
                                                    <TableRow key={payment.id}>
                                                        <TableCell className="font-medium">
                                                            {formatPrice(payment.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payment.package_title ?? "—"}
                                                            {payment.package_price != null && (
                                                                <span className="text-muted-foreground ml-1 text-xs">
                                                                    ({formatPrice(payment.package_price)}
                                                                    {payment.package_discount != null &&
                                                                        payment.package_discount > 0 && (
                                                                            <>, {payment.package_discount}% off</>
                                                                        )}
                                                                    )
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payment.package_is_tiral ? (
                                                                <TrialBadge />
                                                            ) : (
                                                                <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                                                                    No
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payment.cancelled_at ? (
                                                                <Badge variant="destructive">Cancelled</Badge>
                                                            ) : (
                                                                <Badge variant={payment.is_success ? "default" : "secondary"}>
                                                                    {payment.is_success ? "Success" : "Failed"}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="space-y-1">
                                                            {payment.cancelled_at ? (
                                                                <span className="text-muted-foreground">—</span>
                                                            ) : (
                                                                <>
                                                                    {expiry.type === "no_date" && (
                                                                        <span className="text-muted-foreground text-xs">
                                                                            No expiry
                                                                        </span>
                                                                    )}
                                                                    {(expiry.type === "expired" || expiry.type === "active") && (
                                                                        <Badge
                                                                            variant={
                                                                                variant === "destructive"
                                                                                    ? "destructive"
                                                                                    : "secondary"
                                                                            }
                                                                            className="text-xs"
                                                                            title={expireTooltip}
                                                                        >
                                                                            <TimeLeftLabel expiresAt={payment.expires_at} />
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>

                        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4">
                            <SectionTitle className="mb-0 flex items-center gap-2 text-foreground">
                                <BanknoteArrowUp className="size-4 shrink-0" />
                                Top ups
                            </SectionTitle>
                            <div className="overflow-x-auto">
                                <AmountTimeTable rows={topUps} isLoading={topUpsLoading} emptyLabel="No top ups found." />
                            </div>
                        </div>

                        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4">
                            <SectionTitle className="mb-0 flex items-center gap-2 text-foreground">
                                <BanknoteArrowDown className="size-4 shrink-0" />
                                Withdrawals
                            </SectionTitle>
                            <div className="overflow-x-auto">
                                <AmountTimeTable
                                    rows={withdrawals}
                                    isLoading={withdrawalsLoading}
                                    emptyLabel="No withdrawals found."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
}
