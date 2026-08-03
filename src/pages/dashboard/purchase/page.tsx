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
import { usePackagesQuery, usePurchasePackageMutation } from "@/modules/payment";
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

export default function DashboardPurchasePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const kind = parsePurchaseKind(searchParams.get("kind"));
    const packageId = searchParams.get("package_id");
    const billingPeriod = parseBillingPeriod(searchParams.get("billing_period"));

    const { data: packages = [], isLoading, isError } = usePackagesQuery();
    const purchaseMutation = usePurchasePackageMutation();

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
                        description="Open this page from packages, top up, or withdraw with a valid kind query."
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

    if (kind === "top_up" || kind === "withdraw") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{kind === "top_up" ? "Top up" : "Withdraw"}</CardTitle>
                    <CardDescription>This purchase flow is not available yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Stripe checkout for {kind === "top_up" ? "top up" : "withdraw"} will be added later.
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
