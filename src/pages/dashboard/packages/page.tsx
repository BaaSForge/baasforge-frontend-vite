"use client";

import { PackageDescription } from "@/components/package-description";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePackagesQuery, usePaidPackagesQuery } from "@/modules/payment";
import { InfoIcon, ShoppingCartIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { TrialBadge } from "@/modules/payment/components/trial-badge";

export default function DashboardPackagesPage() {
  const { data: packages = [], isLoading } = usePackagesQuery();
  const { data: paidPackagesData } = usePaidPackagesQuery();
  const paidPackages = paidPackagesData?.paid_packages ?? [];
  const largestTier = paidPackagesData?.largest_tier ?? 0;

  const handlePurchase = (slug: string) => {
    // TODO: wire to payment flow (e.g. redirect to checkout or open modal)
    console.log("Purchase package:", slug);
  };

  const purchasedSlugs = new Set(paidPackages.map((p) => p.slug));

  return (
    <section className="flex flex-1 flex-col gap-4 p-4">
      {paidPackages.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Your paid packages: {paidPackages.map((p) => p.title).join(", ")}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full py-12 text-center text-sm">
            Loading packages…
          </p>
        ) : packages.length === 0 ? (
          <p className="text-muted-foreground col-span-full py-12 text-center text-sm">
            No packages available.
          </p>
        ) : (
          packages.map((pkg) => {
            const hasDiscount = pkg.discount_percent != null && pkg.discount_percent > 0;
            const discountedPrice = hasDiscount
              ? pkg.price * (1 - (pkg.discount_percent ?? 0) / 100)
              : pkg.price;

            const isPurchased = purchasedSlugs.has(pkg.slug);
            const isDisabled = isPurchased || pkg.tier <= largestTier;

            return (
              <Card key={pkg.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">{pkg.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {formatPrice(discountedPrice)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="line-through">
                            {formatPrice(pkg.price)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {pkg.discount_percent}% off
                          </Badge>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  {pkg.is_trial && (
                    <TrialBadge />
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <PackageDescription content={pkg.description} />
                </CardContent>
                <CardFooter className="pt-4 flex flex-col gap-2">
                  {isDisabled && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <InfoIcon className="mr-2 text-blue-500 size-4" aria-hidden />
                      {isPurchased ? "You have already purchased this package." : "You can’t purchase packages with a tier lower than your current package."}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg.slug)}
                    disabled={isDisabled}
                  >
                    <ShoppingCartIcon className="size-4" aria-hidden />
                    {isPurchased ? "Purchased" : "Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
