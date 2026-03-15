"use client";

import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { TimeLeftLabel } from "@/components/time-left-label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePaymentsQuery } from "@/modules/payment";
import { TrialBadge } from "@/modules/payment/components/trial-badge";
import { formatDateTime, getTimeLeft, type TimeLeft } from "@/utils/time";

function formatAmount(amount: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function getExpiryBadgeVariant(info: TimeLeft): "destructive" | "secondary" | null {
    if (info.type === "no_date" || info.type === "expired") return "destructive";
    if (info.type === "active") {
        if (info.days >= 1) return info.days <= 3 ? "destructive" : "secondary";
        return "destructive";
    }
    return null;
}

export default function DashboardPaymentsPage() {
    const { data: payments = [], isLoading } = usePaymentsQuery();

    return (
        <>
            <PageTitleBox title="Payments" />
            <Container>
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
                        ) : payments.length === 0 ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">No payments found.</p>
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
                                        const expireTooltip = payment.expires_at ? `Expires at: ${formatDateTime(payment.expires_at)}` : "";
                                        const variant = getExpiryBadgeVariant(expiry);
                                        return (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                                                <TableCell>
                                                    {payment.package_title ?? "—"}
                                                    {payment.package_price != null && (
                                                        <span className="text-muted-foreground ml-1 text-xs">
                                                            ({formatAmount(payment.package_price)}
                                                            {payment.package_discount != null && payment.package_discount > 0 && (
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
                                                        <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">No</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.is_success ? "default" : "secondary"}>
                                                        {payment.is_success ? "Success" : "Failed"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="space-y-1">
                                                    {expiry.type === "no_date" && <span className="text-muted-foreground text-xs">No expiry</span>}
                                                    {(expiry.type === "expired" || expiry.type === "active") && (
                                                        <Badge
                                                            variant={variant === "destructive" ? "destructive" : "secondary"}
                                                            className="text-xs"
                                                            title={expireTooltip}
                                                        >
                                                            <TimeLeftLabel expiresAt={payment.expires_at} />
                                                        </Badge>
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
            </Container>
        </>
    );
}
