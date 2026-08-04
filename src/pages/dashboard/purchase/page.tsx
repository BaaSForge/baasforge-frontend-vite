"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import type { BillingPeriod, PurchaseKind } from "@/modules/payment";
import {
    useInitiateTopUpMutation,
    usePackagesQuery,
    usePurchasePackageMutation,
} from "@/modules/payment";
import { packageAmountForBillingPeriod } from "@/modules/payment/lib/package-amount";
import { AlertCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

function parsePurchaseKind(value: string | null): PurchaseKind | null {
    if (value === "package" || value === "top_up" || value === "withdraw") return value;
    return null;
}

function parseBillingPeriod(value: string | null): BillingPeriod {
    return value === "annual" ? "annual" : "monthly";
}

function parseTopUpAmount(value: string | null): number | null {
    if (value == null || value === "") return null;
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount) || amount < 5) return null;
    return amount;
}

export default function DashboardPurchasePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const kind = parsePurchaseKind(searchParams.get("kind"));
    const packageId = searchParams.get("package_id");
    const billingPeriod = parseBillingPeriod(searchParams.get("billing_period"));
    const topUpAmount = parseTopUpAmount(searchParams.get("amount"));

    const { data: packages = [], isLoading, isError } = usePackagesQuery();
    const purchaseMutation = usePurchasePackageMutation();
    const topUpMutation = useInitiateTopUpMutation();

    if (kind == null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invalid purchase</CardTitle>
                    <CardDescription>Missing or unsupported purchase kind.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContentEmptyState
                        title="Nothing to purchase"
                        description="Open this page from packages or top up with a valid kind query."
                    />
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/dashboard/packages">
                            <ArrowLeft className="size-4" aria-hidden />
                            Back to packages
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (kind === "withdraw") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Withdraw</CardTitle>
                    <CardDescription>Withdrawals are temporarily unavailable.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>
                            We’re working on withdrawals. Please try again later. If you need to withdraw now, contact us
                            at{" "}
                            <a
                                href="mailto:support@baasforge.com"
                                className="text-foreground underline underline-offset-2"
                            >
                                support@baasforge.com
                            </a>
                            .
                        </span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/dashboard/payments">
                            <ArrowLeft className="size-4" aria-hidden />
                            Back to balance & payments
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (kind === "top_up") {
        if (topUpAmount == null) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Top up</CardTitle>
                        <CardDescription>A valid amount of at least $5 is required.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/dashboard/payments">
                                <ArrowLeft className="size-4" aria-hidden />
                                Back to balance & payments
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            );
        }

        const handleConfirmTopUp = () => {
            if (topUpMutation.isPending) return;
            topUpMutation.mutate(topUpAmount, {
                onSuccess: (data) => {
                    if (!data.checkout_url) return;
                    window.location.assign(data.checkout_url);
                },
            });
        };

        const handleCancelTopUp = () => {
            if (location.key !== "default" && window.history.length > 1) {
                navigate(-1);
                return;
            }
            navigate("/dashboard/payments");
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Confirm top up</CardTitle>
                    <CardDescription>Review the amount, then continue to secure checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Type</TableCell>
                                <TableCell className="text-right font-medium">Top up</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Amount</TableCell>
                                <TableCell className="text-right text-base font-semibold tabular-nums">
                                    {formatPrice(topUpAmount)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <p className="text-muted-foreground text-xs">
                        You’ll be redirected to Stripe to complete payment securely. Funds are added after payment
                        succeeds.
                    </p>
                    {topUpMutation.isError ? (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                            {topUpMutation.error instanceof Error
                                ? topUpMutation.error.message
                                : "Top up failed. Please try again."}
                        </div>
                    ) : null}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:flex-1"
                        onClick={handleCancelTopUp}
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Cancel
                    </Button>
                    <Button
                        className="w-full sm:flex-1"
                        onClick={handleConfirmTopUp}
                        disabled={topUpMutation.isPending}
                    >
                        <CreditCard className="size-4" aria-hidden />
                        {topUpMutation.isPending ? "Starting checkout…" : "Continue to payment"}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (packageId == null || packageId === "") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Package purchase</CardTitle>
                    <CardDescription>A package id is required.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/dashboard/packages">
                            <ArrowLeft className="size-4" aria-hidden />
                            Back to packages
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-10">
                    <ContentLoadingState label="Loading purchase details…" />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="py-10">
                    <ContentErrorState title="Failed to load package" subtitle="Try again from the packages page." />
                </CardContent>
            </Card>
        );
    }

    const pkg = packages.find((item) => item.id === packageId);
    if (pkg == null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Package not found</CardTitle>
                    <CardDescription>This package is unavailable or inactive.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/dashboard/packages">
                            <ArrowLeft className="size-4" aria-hidden />
                            Back to packages
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const amount = packageAmountForBillingPeriod(pkg, billingPeriod);
    const isAnnual = billingPeriod === "annual";
    const monthlyEquivalent = isAnnual ? amount / 12 : null;
    if (amount <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Free package</CardTitle>
                    <CardDescription>Claim free packages from the packages page.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link to="/dashboard/packages">
                            <ArrowLeft className="size-4" aria-hidden />
                            Back to packages
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const handleConfirm = () => {
        if (purchaseMutation.isPending) return;
        purchaseMutation.mutate(
            { packageId: pkg.id, billingPeriod },
            {
                onSuccess: (data) => {
                    if (!data.checkout_url) {
                        return;
                    }
                    window.location.assign(data.checkout_url);
                },
            },
        );
    };

    const handleCancel = () => {
        if (location.key !== "default" && window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate("/dashboard/packages");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Confirm purchase</CardTitle>
                <CardDescription>Review the details, then continue to secure checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="text-muted-foreground">Type</TableCell>
                            <TableCell className="text-right font-medium">Package</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="text-muted-foreground">Package</TableCell>
                            <TableCell className="text-right font-medium">{pkg.title}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="text-muted-foreground">Billing period</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="secondary" className="capitalize">
                                    {billingPeriod}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        {monthlyEquivalent != null ? (
                            <TableRow>
                                <TableCell className="text-muted-foreground">Monthly price</TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    {formatPrice(monthlyEquivalent)}
                                    <span className="text-muted-foreground font-normal">/mo</span>
                                </TableCell>
                            </TableRow>
                        ) : null}
                        <TableRow>
                            <TableCell className="text-muted-foreground">
                                {isAnnual ? "Billed annually" : "Amount"}
                            </TableCell>
                            <TableCell className="text-right text-base font-semibold tabular-nums">
                                {formatPrice(amount)}
                                {isAnnual ? (
                                    <span className="text-muted-foreground text-sm font-normal">/yr</span>
                                ) : null}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <p className="text-muted-foreground text-xs">
                    You’ll be redirected to Stripe to complete payment securely.
                </p>
                {purchaseMutation.isError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        {purchaseMutation.error instanceof Error
                            ? purchaseMutation.error.message
                            : "Purchase failed. Please try again."}
                    </div>
                ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={handleCancel}>
                    <ArrowLeft className="size-4" aria-hidden />
                    Cancel
                </Button>
                <Button className="w-full sm:flex-1" onClick={handleConfirm} disabled={purchaseMutation.isPending}>
                    <CreditCard className="size-4" aria-hidden />
                    {purchaseMutation.isPending ? "Starting checkout…" : "Continue to payment"}
                </Button>
            </CardFooter>
        </Card>
    );
}
