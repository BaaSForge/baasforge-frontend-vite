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
import { useInitiateTopUpMutation } from "@/modules/payment";
import { useId, useState } from "react";

type TopUpModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
    const formId = useId();
    const [amount, setAmount] = useState("");
    const initiateTopUpMutation = useInitiateTopUpMutation();

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setAmount("");
        }
        onOpenChange(nextOpen);
    };

    const parsedAmount = Number.parseFloat(amount);
    const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount >= 5;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValidAmount || initiateTopUpMutation.isPending) return;

        initiateTopUpMutation.mutate(parsedAmount, {
            onSuccess: () => {
                handleOpenChange(false);
            },
        });
    };

    return (
        <CentricModal open={open} onOpenChange={handleOpenChange} dismissOnOverlayClick>
            <CentricModalContent className="sm:max-w-md" showCloseButton>
                <CentricModalHeader className="text-left">
                    <CentricModalTitle>Top up</CentricModalTitle>
                    <CentricModalDescription className="text-left">
                        Enter the amount you want to add to your balance.
                    </CentricModalDescription>
                </CentricModalHeader>

                <form id={formId} onSubmit={handleSubmit} className="space-y-2">
                    <Label htmlFor="top-up-amount">Amount</Label>
                    <InputGroup>
                        <InputGroupAddon align="inline-start">
                            <InputGroupText>$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                            id="top-up-amount"
                            type="number"
                            inputMode="decimal"
                            min="5"
                            step="0.01"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            disabled={initiateTopUpMutation.isPending}
                            autoFocus
                        />
                    </InputGroup>
                    <p className="text-muted-foreground text-xs">Minimum is $5</p>
                </form>

                <CentricModalFooter className="gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={initiateTopUpMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        disabled={!isValidAmount || initiateTopUpMutation.isPending}
                    >
                        {initiateTopUpMutation.isPending ? "Topping up…" : "Top up"}
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );
}
