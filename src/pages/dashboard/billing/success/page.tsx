"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryKeys } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Wallet } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";

export default function DashboardBillingSuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const queryClient = useQueryClient();

    useEffect(() => {
        void queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAID_PACKAGES });
        void queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_PAYMENTS });
        void queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_TOP_UPS });
        void queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_BALANCE });
        void queryClient.invalidateQueries({ queryKey: QueryKeys.PAYMENT_SUBSCRIPTION_RESERVE });
    }, [queryClient]);

    return (
        <Card>
            <CardHeader className="items-center text-center">
                <CheckCircle2 className="size-12 text-emerald-500" aria-hidden />
                <CardTitle className="text-xl">Payment successful</CardTitle>
                <CardDescription>
                    Your payment went through. Balance and package access update shortly after Stripe confirms the
                    charge.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
                {sessionId ? (
                    <p className="break-all font-mono text-xs">
                        Session: {sessionId}
                    </p>
                ) : null}
                <p>You can review your balance and payment history next.</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button asChild className="w-full">
                    <Link to="/dashboard/payments">
                        <Wallet className="size-4" aria-hidden />
                        Go to balance & payments
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard">Back to dashboard</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
