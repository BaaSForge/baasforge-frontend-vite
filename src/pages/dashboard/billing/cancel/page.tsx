"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleX, Package, Wallet } from "lucide-react";
import { Link } from "react-router";

export default function DashboardBillingCancelPage() {
    return (
        <Card>
            <CardHeader className="justify-items-center text-center">
                <CircleX className="size-12 text-muted-foreground" aria-hidden />
                <CardTitle className="text-xl">Payment cancelled</CardTitle>
                <CardDescription>
                    Checkout was cancelled. No charge was made and your current plan is unchanged.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
                You can try again whenever you’re ready, or review your balance first.
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button asChild className="w-full">
                    <Link to="/dashboard/packages">
                        <Package className="size-4" aria-hidden />
                        Back to packages
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard/payments">
                        <Wallet className="size-4" aria-hidden />
                        Go to balance & payments
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
