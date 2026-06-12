"use client";

import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { PackageDescription } from "@/components/package-description";
import { Container } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { usePackagesQuery, usePaidPackagesQuery, usePurchasePackageMutation } from "@/modules/payment";
import { TrialBadge } from "@/modules/payment/components/trial-badge";
import { InfoIcon, ShoppingCartIcon } from "lucide-react";

export default function DashboardPackagesPage() {
    const { data: packages = [], isLoading, error } = usePackagesQuery();
    const { data: paidPackagesData } = usePaidPackagesQuery();
    const purchaseMutation = usePurchasePackageMutation();
    const paidPackages = paidPackagesData?.payments?.map((p) => p.package) ?? [];
    const largestTier = paidPackagesData?.largest_tier ?? 0;
    const canPurchaseTrial = paidPackagesData?.can_purchase_trial ?? false;
    const isProcessing = purchaseMutation.isPending;

    const visiblePackages = canPurchaseTrial ? packages : packages.filter((pkg) => !pkg.is_trial);

    const handlePurchase = (packageId: string) => {
        purchaseMutation.mutate(packageId);
    };

    const purchasedSlugs = new Set(paidPackages.map((p) => p.slug));

    return (
        <>
            <Container className="pt-0">
                <div className="py-4">
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
                                const discountedPrice = hasDiscount ? pkg.price * (1 - (pkg.discount_percent ?? 0) / 100) : pkg.price;

                                const isPurchased = purchasedSlugs.has(pkg.slug);
                                const isTierTooLow = pkg.tier <= largestTier;
                                const isDisabled = isPurchased || isTierTooLow || isProcessing;

                                return (
                                    <Card key={pkg.id} className="flex flex-col">
                                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                                            <div className="space-y-1.5">
                                                <CardTitle className="text-base">{pkg.title}</CardTitle>
                                                <CardDescription className="flex flex-wrap items-center gap-2">
                                                    <span className="font-medium text-foreground">{formatPrice(discountedPrice)}</span>
                                                    {hasDiscount && (
                                                        <>
                                                            <span className="line-through">{formatPrice(pkg.price)}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {pkg.discount_percent}% off
                                                            </Badge>
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
                                            <Button className="w-full" onClick={() => handlePurchase(pkg.id)} disabled={isDisabled}>
                                                <ShoppingCartIcon className="size-4" aria-hidden />
                                                {isProcessing && purchaseMutation.variables === pkg.id ? "Processing…" : isPurchased ? "Purchased" : "Purchase"}
                                            </Button>
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
