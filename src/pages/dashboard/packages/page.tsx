"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { PackageDescription } from "@/components/package-description";
import { Container } from "@/components/page-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";
import {
    claimFreePackage,
    usePackagesQuery,
    usePaidPackagesQuery,
    usePersistedBillingPeriod,
    usePurchasePackageMutation,
} from "@/modules/payment";
import { TrialBadge } from "@/modules/payment/components/trial-badge";
import {
    ANNUAL_BILLING_DISCOUNT_PERCENT,
    packageAmountForBillingPeriod,
} from "@/modules/payment/lib/package-amount";
import { Info, InfoIcon, ShoppingCartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

const ANNUAL_TIP_HIDE_MS = 5000;

export default function DashboardPackagesPage() {
    const navigate = useNavigate();
    const [billingPeriod, setBillingPeriod] = usePersistedBillingPeriod();
    const [annualTipOpen, setAnnualTipOpen] = useState(false);
    const annualTipTimeoutRef = useRef<number | null>(null);
    const isAnnual = billingPeriod === "annual";
    const purchaseMutation = usePurchasePackageMutation();

    const { data: packages = [], isLoading, error } = usePackagesQuery();
    const { data: paidPackagesData } = usePaidPackagesQuery();
    const paidPackages = paidPackagesData?.payments?.map((p) => p.package) ?? [];
    const largestTier = paidPackagesData?.largest_tier ?? 0;
    const canPurchaseTrial = paidPackagesData?.can_purchase_trial ?? false;

    const visiblePackages = canPurchaseTrial ? packages : packages.filter((pkg) => !pkg.is_trial);
    const purchasedSlugs = new Set(paidPackages.map((p) => p.slug));

    useEffect(() => {
        return () => {
            if (annualTipTimeoutRef.current != null) {
                window.clearTimeout(annualTipTimeoutRef.current);
            }
        };
    }, []);

    const clearAnnualTipTimeout = () => {
        if (annualTipTimeoutRef.current != null) {
            window.clearTimeout(annualTipTimeoutRef.current);
            annualTipTimeoutRef.current = null;
        }
    };

    const showAnnualTip = () => {
        clearAnnualTipTimeout();
        setAnnualTipOpen(true);
        annualTipTimeoutRef.current = window.setTimeout(() => {
            setAnnualTipOpen(false);
            annualTipTimeoutRef.current = null;
        }, ANNUAL_TIP_HIDE_MS);
    };

    const hideAnnualTip = () => {
        clearAnnualTipTimeout();
        setAnnualTipOpen(false);
    };

    const handleClaimFreePackage = (packageId: string) => {
        if (purchaseMutation.isPending) return;
        claimFreePackage(purchaseMutation.mutate, { packageId, billingPeriod }, {
            onSuccess: () => {
                navigate("/dashboard/billing/success", { replace: true });
            },
        });
    };

    return (
        <>
            <Container className="pt-0">
                <div className="py-4">
                    <Alert className="mb-6 items-start">
                        <Info />
                        <AlertTitle>You pay the sale price — that amount is added to your balance</AlertTitle>
                        <AlertDescription>
                            <p>
                                Package discounts lower what you are charged. Your balance increases by exactly that
                                charged amount (for example, a $30 list plan at 20% off credits <span className="font-medium text-foreground">$24</span>
                                , not $30). You also get tier usage discounts while the package is active. See{" "}
                                <Link
                                    to="/docs/security-billing/costs"
                                    reloadDocument
                                    className="text-foreground font-medium underline underline-offset-4"
                                >
                                    Costs &amp; Billing
                                </Link>
                                .
                            </p>
                        </AlertDescription>
                    </Alert>
                    <div className="mb-6 flex justify-center">
                        <TooltipProvider>
                            <Tooltip open={annualTipOpen} disableHoverableContent>
                                <TooltipTrigger asChild>
                                    <div>
                                        <ToggleGroup
                                            type="single"
                                            variant="outline"
                                            value={billingPeriod}
                                            onValueChange={(value) => {
                                                if (value === "annual") {
                                                    setBillingPeriod("annual");
                                                    showAnnualTip();
                                                    return;
                                                }
                                                if (value === "monthly") {
                                                    setBillingPeriod("monthly");
                                                    hideAnnualTip();
                                                }
                                            }}
                                        >
                                            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
                                            <ToggleGroupItem value="annual">
                                                Annual
                                                <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
                                                    Save {ANNUAL_BILLING_DISCOUNT_PERCENT}%
                                                </Badge>
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={2} className="pointer-events-none">
                                    Prices shown as monthly equivalent. Billed yearly.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {isLoading ? (
                        <ContentLoadingState label="Loading packages…" />
                    ) : error ? (
                        <ContentErrorState
                            title="Failed to load packages"
                            subtitle="Try refreshing the page and try again."
                        />
                    ) : visiblePackages.length === 0 ? (
                        <ContentEmptyState
                            title="No packages available"
                            description="There are no packages to purchase right now."
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visiblePackages.map((pkg) => {
                                const hasDiscount = pkg.discount_percent != null && pkg.discount_percent > 0;
                                const monthlyAmount = packageAmountForBillingPeriod(pkg, "monthly");
                                const periodAmount = packageAmountForBillingPeriod(pkg, billingPeriod);
                                const displayMonthly = isAnnual ? periodAmount / 12 : periodAmount;
                                const compareMonthly = isAnnual ? monthlyAmount : pkg.price;
                                const isFree = periodAmount <= 0;

                                const isPurchased = purchasedSlugs.has(pkg.slug);
                                const isTierTooLow = pkg.tier <= largestTier;
                                const isDisabled = isPurchased || isTierTooLow || purchaseMutation.isPending;
                                const isClaimingThis =
                                    purchaseMutation.isPending && purchaseMutation.variables?.packageId === pkg.id;
                                const purchaseHref = `/dashboard/purchase?kind=package&package_id=${encodeURIComponent(pkg.id)}&billing_period=${billingPeriod}`;

                                return (
                                    <Card key={pkg.id} className="flex flex-col">
                                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                                            <div className="space-y-1.5">
                                                <CardTitle className="text-base">{pkg.title}</CardTitle>
                                                <CardDescription className="flex flex-wrap items-center gap-2">
                                                    <span className="font-medium text-foreground">
                                                        {formatPrice(displayMonthly)}
                                                        <span className="text-muted-foreground font-normal">/mo</span>
                                                    </span>
                                                    {(hasDiscount || isAnnual) && displayMonthly < compareMonthly && (
                                                        <>
                                                            <span className="line-through">
                                                                {formatPrice(compareMonthly)}
                                                            </span>
                                                            {hasDiscount && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {pkg.discount_percent}% off
                                                                </Badge>
                                                            )}
                                                            {isAnnual && (
                                                                <Badge className="border-transparent bg-blue-500/15 text-xs text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
                                                                    {ANNUAL_BILLING_DISCOUNT_PERCENT}% annual
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            {pkg.is_trial && <TrialBadge />}
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <PackageDescription content={pkg.description} />
                                        </CardContent>
                                        <CardFooter className="pt-4 flex flex-col gap-2">
                                            {(isPurchased || isTierTooLow) && (
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <InfoIcon className="mr-2 text-blue-500 size-4" aria-hidden />
                                                    {isPurchased
                                                        ? "You have already purchased this package."
                                                        : "You can’t purchase packages with a tier lower than your current package."}
                                                </div>
                                            )}
                                            {isPurchased || isTierTooLow ? (
                                                <Button className="w-full" disabled>
                                                    <ShoppingCartIcon className="size-4" aria-hidden />
                                                    {isPurchased ? "Purchased" : "Purchase"}
                                                </Button>
                                            ) : isFree ? (
                                                <Button
                                                    className="w-full"
                                                    disabled={isDisabled}
                                                    onClick={() => handleClaimFreePackage(pkg.id)}
                                                >
                                                    <ShoppingCartIcon className="size-4" aria-hidden />
                                                    {isClaimingThis ? "Claiming…" : "Get free"}
                                                </Button>
                                            ) : (
                                                <Button className="w-full" asChild disabled={purchaseMutation.isPending}>
                                                    <Link to={purchaseHref}>
                                                        <ShoppingCartIcon className="size-4" aria-hidden />
                                                        Purchase
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>
        </>
    );
}
