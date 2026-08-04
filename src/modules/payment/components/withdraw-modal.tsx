"use client";

import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { AlertCircle } from "lucide-react";
/*
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
    getSliderThumbCenterOffsetPx,
    getSliderValuePercent,
    Slider,
} from "@/components/ui/slider";
import { cn, formatPrice } from "@/lib/utils";
import { useBalanceQuery, useInitiateWithdrawalMutation, useSubscriptionReserveQuery } from "@/modules/payment";
import { useId, useMemo, useState } from "react";
*/

type WithdrawModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/*
function floorToCents(value: number) {
    return Math.floor(value * 100) / 100;
}

function formatAmountInput(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
*/

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
    // Temporarily disabled — restore the implementation below when re-enabling withdrawals.
    return (
        <CentricModal open={open} onOpenChange={onOpenChange} dismissOnOverlayClick>
            <CentricModalContent className="sm:max-w-md" showCloseButton>
                <CentricModalHeader className="text-left">
                    <CentricModalTitle>Withdraw</CentricModalTitle>
                    <CentricModalDescription className="text-left">
                        Withdrawals are temporarily unavailable.
                    </CentricModalDescription>
                </CentricModalHeader>

                <div className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                        We’re working on withdrawals. Please try again later. If you need to withdraw now, contact us at{" "}
                        <a
                            href="mailto:support@baasforge.com"
                            className="text-foreground underline underline-offset-2"
                        >
                            support@baasforge.com
                        </a>
                        .
                    </span>
                </div>

                <CentricModalFooter className="gap-2 sm:justify-end">
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );

    /*
    const formId = useId();
    const [amount, setAmount] = useState("");
    const { data: balance } = useBalanceQuery();
    const { data: subscriptionReserve } = useSubscriptionReserveQuery(open);
    const initiateWithdrawalMutation = useInitiateWithdrawalMutation();

    const availableBalance = floorToCents(balance?.balance ?? 0);
    const canWithdraw = availableBalance > 1;
    const maxWithdrawWithoutCancel = floorToCents(
        Math.min(subscriptionReserve?.max_withdraw_without_cancel ?? 0, availableBalance),
    );
    const hasSafeSnap = maxWithdrawWithoutCancel > 0 && maxWithdrawWithoutCancel < availableBalance;

    const parsedAmount = Number.parseFloat(amount);
    const sliderValue = Number.isFinite(parsedAmount)
        ? Math.min(Math.max(floorToCents(parsedAmount), 0), availableBalance)
        : 0;

    const willCancelSubscription =
        Number.isFinite(parsedAmount) &&
        parsedAmount > 0 &&
        parsedAmount > maxWithdrawWithoutCancel;

    const isValidAmount =
        canWithdraw && Number.isFinite(parsedAmount) && parsedAmount >= 1 && parsedAmount <= availableBalance;

    const snapPercent = useMemo(() => {
        if (!hasSafeSnap || availableBalance <= 0) return null;
        return getSliderValuePercent(maxWithdrawWithoutCancel, 0, availableBalance);
    }, [availableBalance, hasSafeSnap, maxWithdrawWithoutCancel]);

    const snapLabelStyle = useMemo(() => {
        if (snapPercent == null) return undefined;
        const offsetPx = getSliderThumbCenterOffsetPx(snapPercent);
        return { left: `calc(${snapPercent}% + ${offsetPx}px)` };
    }, [snapPercent]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setAmount("");
        }
        onOpenChange(nextOpen);
    };

    const applyAmount = (next: number) => {
        const clamped = floorToCents(Math.min(Math.max(next, 0), availableBalance));
        setAmount(clamped === 0 ? "" : formatAmountInput(clamped));
    };

    const handleSliderChange = (values: number[]) => {
        let next = floorToCents(values[0] ?? 0);

        if (hasSafeSnap) {
            const snapThreshold = Math.max(availableBalance * 0.03, 0.5);
            if (Math.abs(next - maxWithdrawWithoutCancel) <= snapThreshold) {
                next = maxWithdrawWithoutCancel;
            }
        }

        applyAmount(next);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValidAmount || initiateWithdrawalMutation.isPending) return;

        initiateWithdrawalMutation.mutate(parsedAmount, {
            onSuccess: () => {
                handleOpenChange(false);
            },
        });
    };

    return (
        <CentricModal open={open} onOpenChange={handleOpenChange} dismissOnOverlayClick>
            <CentricModalContent className="sm:max-w-md" showCloseButton>
                <CentricModalHeader className="text-left">
                    <CentricModalTitle>Withdraw</CentricModalTitle>
                    <CentricModalDescription className="text-left">
                        Enter the amount you want to withdraw from your balance.
                    </CentricModalDescription>
                </CentricModalHeader>

                <form
                    id={formId}
                    onSubmit={handleSubmit}
                    className={cn("space-y-3", !canWithdraw && "pointer-events-none opacity-50")}
                    aria-disabled={!canWithdraw}
                >
                    <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Amount</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText>$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="withdraw-amount"
                                type="number"
                                inputMode="decimal"
                                min="1"
                                step="0.01"
                                max={canWithdraw ? availableBalance : undefined}
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                disabled={!canWithdraw || initiateWithdrawalMutation.isPending}
                                autoFocus={canWithdraw}
                            />
                        </InputGroup>
                    </div>

                    {canWithdraw ? (
                        <div className="space-y-2 pt-1">
                            <div className="px-1">
                                {snapPercent != null && (
                                    <div className="relative mb-1 h-3">
                                        <span
                                            className="text-muted-foreground absolute top-0 -translate-x-1/2 text-[10px] leading-none whitespace-nowrap"
                                            style={snapLabelStyle}
                                        >
                                            Keep package
                                        </span>
                                    </div>
                                )}
                                <Slider
                                    min={0}
                                    max={availableBalance}
                                    step={0.01}
                                    value={[sliderValue]}
                                    onValueChange={handleSliderChange}
                                    marks={
                                        hasSafeSnap
                                            ? [{ value: maxWithdrawWithoutCancel }]
                                            : undefined
                                    }
                                    disabled={
                                        !canWithdraw ||
                                        initiateWithdrawalMutation.isPending ||
                                        availableBalance <= 0
                                    }
                                    aria-label="Withdrawal amount"
                                />
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                                <span>{formatPrice(0)}</span>
                                <span>{formatPrice(availableBalance)}</span>
                            </div>
                            {hasSafeSnap ? (
                                <p className="text-muted-foreground text-xs">
                                    Up to {formatPrice(maxWithdrawWithoutCancel)} keeps your active package. Minimum is $1.
                                </p>
                            ) : (
                                <p className="text-muted-foreground text-xs">
                                    Minimum is $1 · Available balance: {formatPrice(availableBalance)}
                                </p>
                            )}
                            {willCancelSubscription ? (
                                <p className="text-destructive text-xs" role="alert">
                                    This withdrawal will cancel your active subscription package, and you’ll lose the
                                    usage discount on future usage.
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="text-destructive text-xs">
                            You can’t withdraw because your balance isn’t high enough. Available balance:{" "}
                            {formatPrice(availableBalance)}
                        </p>
                    )}
                </form>

                <CentricModalFooter className="gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={initiateWithdrawalMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        disabled={!isValidAmount || initiateWithdrawalMutation.isPending}
                    >
                        {initiateWithdrawalMutation.isPending ? "Withdrawing…" : "Withdraw"}
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );
    */
}
