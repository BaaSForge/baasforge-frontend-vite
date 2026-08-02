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
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";
import { useBalanceQuery, useInitiateWithdrawalMutation } from "@/modules/payment";
import { useEffect, useId, useState } from "react";

type WithdrawModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
    const formId = useId();
    const [amount, setAmount] = useState("");
    const { data: balance } = useBalanceQuery();
    const initiateWithdrawalMutation = useInitiateWithdrawalMutation();
    const availableBalance = balance?.balance ?? 0;
    const canWithdraw = availableBalance > 1;

    useEffect(() => {
        if (!open) {
            setAmount("");
        }
    }, [open]);

    const parsedAmount = Number.parseFloat(amount);
    const isValidAmount =
        canWithdraw && Number.isFinite(parsedAmount) && parsedAmount >= 1 && parsedAmount <= availableBalance;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValidAmount || initiateWithdrawalMutation.isPending) return;

        initiateWithdrawalMutation.mutate(parsedAmount, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <CentricModal open={open} onOpenChange={onOpenChange} dismissOnOverlayClick>
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
                    className={cn("space-y-2", !canWithdraw && "pointer-events-none opacity-50")}
                    aria-disabled={!canWithdraw}
                >
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="withdraw-amount">Amount</Label>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto px-0 text-xs"
                            disabled={!canWithdraw || initiateWithdrawalMutation.isPending}
                            onClick={() => {
                                const roundedDown = Math.floor(availableBalance * 100) / 100;
                                setAmount(String(roundedDown));
                            }}
                        >
                            Withdraw all
                        </Button>
                    </div>
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
                    {canWithdraw ? (
                        <p className="text-muted-foreground text-xs">
                            Minimum is $1 · Available balance: {formatPrice(availableBalance)}
                        </p>
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
                        onClick={() => onOpenChange(false)}
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
}
