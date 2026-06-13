"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Field, FieldContent, FieldDescription, FieldTitle } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";
import {
    buildDocumentationSharePageUrl,
    documentationShareExpiresAtForPreset,
    formatShareExpiryAbsolute,
    formatShareExpiryChipLabel,
    isShareExpiryUrgent,
} from "./documentation-share-expiry";
import { DocumentationShareExpiryChips } from "./documentation-share-expiry-chips";
import {
    useGenerateDocumentationShareKeyMutation,
    useRevokeDocumentationShareKeyMutation,
} from "./mutations";
import { useDocumentationShareKeyQuery } from "./queries";
import type { DocumentationShareExpiryPresetId } from "./types";

type DocumentationShareModalProps = {
    projectId: string;
    releaseId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function PendingActionButton({
    pending,
    disabled,
    className,
    children,
    ...props
}: ComponentProps<typeof Button> & { pending: boolean }) {
    return (
        <Button
            type="button"
            disabled={disabled || pending}
            aria-busy={pending}
            className={className}
            {...props}
        >
            {pending ? <Spinner /> : null}
            {children}
        </Button>
    );
}

export function DocumentationShareModal({ projectId, releaseId, open, onOpenChange }: DocumentationShareModalProps) {
    const [expiryPreset, setExpiryPreset] = useState<DocumentationShareExpiryPresetId>("1m");
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
    const { copied, copy } = useClipboard();

    const shareKeyQuery = useDocumentationShareKeyQuery(projectId, { enabled: open });
    const generateMutation = useGenerateDocumentationShareKeyMutation(projectId);
    const revokeMutation = useRevokeDocumentationShareKeyMutation(projectId);

    const shareKey = shareKeyQuery.data?.documentation_share_key?.trim() ?? "";
    const hasShareKey = shareKey.length > 0;
    const shareUrl = hasShareKey ? buildDocumentationSharePageUrl(projectId, releaseId, shareKey) : "";
    const actionPending = generateMutation.isPending || revokeMutation.isPending;
    const isCopied = copied === "documentation-share-url";
    const currentExpiryChipLabel = formatShareExpiryChipLabel(shareKeyQuery.data?.expires_at);
    const currentExpiryAbsolute = formatShareExpiryAbsolute(shareKeyQuery.data?.expires_at);
    const currentExpiryUrgent = isShareExpiryUrgent(shareKeyQuery.data?.expires_at);

    const generateBody = () => {
        const expiresAt = documentationShareExpiresAtForPreset(expiryPreset);
        return expiresAt != null ? { expires_at: expiresAt } : {};
    };

    const handleGenerate = () => {
        generateMutation.mutate(generateBody(), {
            onSettled: () => setRegenerateDialogOpen(false),
        });
    };

    const handleRevoke = () => {
        revokeMutation.mutate(undefined, {
            onSettled: () => setRevokeDialogOpen(false),
        });
    };

    const modalDescription = shareKeyQuery.isLoading
        ? "Loading share settings…"
        : hasShareKey
          ? "Copy the link below to share public documentation access. Use re-generate to issue a new link and revoke this one."
          : "Create a public link others can open without signing in.";

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-lg" fillViewportOnMobile showCloseButton>
                <CentricModalHeader className="gap-1.5">
                    <CentricModalTitle>Share documentation</CentricModalTitle>
                    <CentricModalDescription>{modalDescription}</CentricModalDescription>
                </CentricModalHeader>

                {shareKeyQuery.isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Spinner className="size-6 text-muted-foreground" />
                    </div>
                ) : shareKeyQuery.error ? (
                    <p className="text-destructive text-sm">Failed to load share link. Try closing and reopening this dialog.</p>
                ) : (
                    <div className={cn("space-y-6", hasShareKey && "pt-4")}>
                        {hasShareKey ? (
                            <>
                                <Field className="flex-col gap-4">
                                    <FieldContent className="gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <FieldTitle>Current link</FieldTitle>
                                            <Badge
                                                variant={currentExpiryUrgent ? "destructive" : "secondary"}
                                                className="rounded-full px-2.5 py-0.5 font-normal"
                                                title={currentExpiryAbsolute ?? undefined}
                                            >
                                                {currentExpiryChipLabel}
                                            </Badge>
                                        </div>
                                        <FieldDescription className="pt-1.5">
                                            Anyone with this URL can view your documentation without signing in.
                                        </FieldDescription>
                                    </FieldContent>
                                    <InputGroup>
                                        <InputGroupInput
                                            readOnly
                                            value={shareUrl}
                                            className="font-mono text-xs"
                                            onFocus={(e) => e.currentTarget.select()}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                aria-label={isCopied ? "Copied" : "Copy link"}
                                                onClick={() => {
                                                    if (!shareUrl) return;
                                                    void copy(shareUrl, "documentation-share-url");
                                                }}
                                            >
                                                {isCopied ? <CheckIcon /> : <CopyIcon />}
                                                {isCopied ? "Copied" : "Copy"}
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>

                                <Separator />

                                <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Replace link</p>
                                        <p className="text-muted-foreground text-sm">
                                            Pick a new expiry, then re-generate. The link above stops working immediately.
                                        </p>
                                    </div>
                                    <DocumentationShareExpiryChips
                                        mode="regenerate"
                                        value={expiryPreset}
                                        onChange={setExpiryPreset}
                                        disabled={actionPending}
                                        className="gap-3"
                                    />
                                </div>
                            </>
                        ) : (
                            <DocumentationShareExpiryChips
                                mode="generate"
                                value={expiryPreset}
                                onChange={setExpiryPreset}
                                disabled={actionPending}
                            />
                        )}
                    </div>
                )}

                {!shareKeyQuery.isLoading && !shareKeyQuery.error ? (
                    <CentricModalFooter className="flex w-full flex-row gap-2">
                        {hasShareKey ? (
                            <AlertDialog
                                open={revokeDialogOpen}
                                onOpenChange={(next) => {
                                    if (!next && revokeMutation.isPending) return;
                                    setRevokeDialogOpen(next);
                                }}
                            >
                                <AlertDialogTrigger asChild>
                                    <PendingActionButton
                                        pending={revokeMutation.isPending}
                                        disabled={actionPending && !revokeMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "min-w-0 flex-1",
                                            "border-destructive/55 bg-transparent text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive",
                                            "dark:bg-transparent dark:hover:bg-destructive/15",
                                        )}
                                    >
                                        Revoke share
                                    </PendingActionButton>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Revoke share link?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            The current link will stop working immediately. You can generate a new one later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={revokeMutation.isPending}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                            disabled={revokeMutation.isPending}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handleRevoke();
                                            }}
                                        >
                                            {revokeMutation.isPending ? <Spinner /> : null}
                                            Revoke
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : null}

                        {hasShareKey ? (
                            <AlertDialog
                                open={regenerateDialogOpen}
                                onOpenChange={(next) => {
                                    if (!next && generateMutation.isPending) return;
                                    setRegenerateDialogOpen(next);
                                }}
                            >
                                <AlertDialogTrigger asChild>
                                    <PendingActionButton
                                        pending={generateMutation.isPending}
                                        disabled={actionPending && !generateMutation.isPending}
                                        className="min-w-0 flex-1"
                                    >
                                        {!generateMutation.isPending ? <RefreshCwIcon className="size-4" /> : null}
                                        Re-generate
                                    </PendingActionButton>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Re-generate share link?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will revoke the current link immediately. Anyone using the old link will lose access,
                                            and you will get a new link to share.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={generateMutation.isPending}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            disabled={generateMutation.isPending}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handleGenerate();
                                            }}
                                        >
                                            {generateMutation.isPending ? <Spinner /> : null}
                                            Re-generate
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <PendingActionButton
                                pending={generateMutation.isPending}
                                className="w-full min-w-0 flex-1"
                                onClick={handleGenerate}
                            >
                                Generate
                            </PendingActionButton>
                        )}
                    </CentricModalFooter>
                ) : null}
            </CentricModalContent>
        </CentricModal>
    );
}
