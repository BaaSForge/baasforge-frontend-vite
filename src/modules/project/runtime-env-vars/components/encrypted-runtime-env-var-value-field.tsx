"use client";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { revealRuntimeEnvVar } from "../api";

const MASK_CHAR = "•";

function maskValue(value: string): string {
    return MASK_CHAR.repeat(value.length);
}

function allowHiddenModeKey(e: KeyboardEvent<HTMLTextAreaElement>): boolean {
    if (e.key === "Tab" || e.key === "Escape") return true;
    if (!e.ctrlKey && !e.metaKey && !e.altKey) return false;
    const key = e.key.toLowerCase();
    return key === "v" || key === "a" || key === "c";
}

type EncryptedRuntimeEnvVarRevealContext = {
    projectId: string;
    envKey: string;
    runtimeId: string;
};

type EncryptedRuntimeEnvVarValueFieldProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onTouched?: () => void;
    onRevealedFromServer?: () => void;
    placeholder: string;
    disabled?: boolean;
    isEdit?: boolean;
    hasExistingValue?: boolean;
    revealContext?: EncryptedRuntimeEnvVarRevealContext;
};

function EncryptedValueVisibilityToggle({
    visible,
    disabled,
    pending,
    onToggle,
    alignToTop = false,
}: {
    visible: boolean;
    disabled: boolean;
    pending?: boolean;
    onToggle: () => void;
    alignToTop?: boolean;
}) {
    return (
        <InputGroupAddon align="inline-end" className={alignToTop ? "self-start pt-2" : undefined}>
            <InputGroupButton
                type="button"
                size="icon-xs"
                aria-label={visible ? "Hide value" : "Show value"}
                aria-pressed={visible}
                aria-busy={pending || undefined}
                disabled={disabled || pending}
                onClick={onToggle}
            >
                {pending ? (
                    <Spinner className="size-3.5" />
                ) : visible ? (
                    <EyeOff className="size-3.5" />
                ) : (
                    <Eye className="size-3.5" />
                )}
            </InputGroupButton>
        </InputGroupAddon>
    );
}

export function EncryptedRuntimeEnvVarValueField({
    id,
    value,
    onChange,
    onTouched,
    onRevealedFromServer,
    placeholder,
    disabled = false,
    isEdit = false,
    hasExistingValue = false,
    revealContext,
}: EncryptedRuntimeEnvVarValueFieldProps) {
    const [visible, setVisible] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealError, setRevealError] = useState<string | null>(null);
    const controlRef = useRef<HTMLTextAreaElement>(null);
    const previousVisibleRef = useRef(visible);
    const editedAfterRevealRef = useRef(false);

    useLayoutEffect(() => {
        const wasVisible = previousVisibleRef.current;
        previousVisibleRef.current = visible;

        if (!visible || wasVisible) return;

        const el = controlRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        const end = el.value.length;
        el.setSelectionRange(end, end);
    }, [visible]);

    const handleToggleVisibility = useCallback(async () => {
        if (visible) {
            setVisible(false);
            setRevealError(null);
            if (isEdit && !editedAfterRevealRef.current) {
                onChange("");
            }
            editedAfterRevealRef.current = false;
            return;
        }

        if (isEdit && revealContext && hasExistingValue) {
            setIsRevealing(true);
            setRevealError(null);
            try {
                const res = await revealRuntimeEnvVar(
                    revealContext.projectId,
                    revealContext.envKey,
                    revealContext.runtimeId,
                );
                editedAfterRevealRef.current = false;
                onChange(res.value ?? "");
                onRevealedFromServer?.();
                setVisible(true);
            } catch (error) {
                setRevealError(getApiErrorMessage(error));
            } finally {
                setIsRevealing(false);
            }
            return;
        }

        setVisible(true);
    }, [visible, isEdit, revealContext, hasExistingValue, onChange, onRevealedFromServer]);

    const commitValue = useCallback(
        (next: string) => {
            editedAfterRevealRef.current = true;
            onTouched?.();
            onChange(next);
        },
        [onChange, onTouched],
    );

    const handleEditHiddenKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (visible || allowHiddenModeKey(e)) return;
        e.preventDefault();
    };

    const handleEditHiddenPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        if (disabled || visible) return;
        e.preventDefault();
        commitValue(e.clipboardData.getData("text"));
    };

    const resolvedPlaceholder =
        hasExistingValue && value.length === 0 ? "Paste to replace" : placeholder;

    if (!isEdit) {
        return (
            <InputGroup className={cn(visible && "items-start has-[>textarea]:h-auto")}>
                {visible ? (
                    <InputGroupTextarea
                        ref={controlRef}
                        id={id}
                        value={value}
                        onChange={(e) => commitValue(e.target.value)}
                        placeholder={resolvedPlaceholder}
                        disabled={disabled}
                        autoComplete="off"
                        rows={4}
                        spellCheck={false}
                        className="font-mono text-sm"
                    />
                ) : (
                    <InputGroupInput
                        id={id}
                        type="password"
                        value={value}
                        onChange={(e) => commitValue(e.target.value)}
                        placeholder={resolvedPlaceholder}
                        disabled={disabled}
                        autoComplete="new-password"
                        className="font-mono text-sm"
                    />
                )}
                <EncryptedValueVisibilityToggle
                    visible={visible}
                    disabled={disabled}
                    alignToTop={visible}
                    onToggle={() => void handleToggleVisibility()}
                />
            </InputGroup>
        );
    }

    return (
        <>
            <InputGroup className="items-start has-[>textarea]:h-auto">
                <InputGroupTextarea
                    ref={controlRef}
                    id={id}
                    value={visible ? value : maskValue(value)}
                    onChange={(e) => {
                        if (!visible) return;
                        commitValue(e.target.value);
                    }}
                    onKeyDown={handleEditHiddenKeyDown}
                    onPaste={handleEditHiddenPaste}
                    placeholder={resolvedPlaceholder}
                    disabled={disabled || isRevealing}
                    autoComplete="off"
                    rows={4}
                    spellCheck={false}
                    className={cn("font-mono text-sm", !visible && value.length > 0 && "tracking-widest")}
                />
                <EncryptedValueVisibilityToggle
                    visible={visible}
                    disabled={disabled}
                    pending={isRevealing}
                    alignToTop
                    onToggle={() => void handleToggleVisibility()}
                />
            </InputGroup>
            {revealError ? (
                <p className="text-destructive mt-1.5 text-xs" role="alert">
                    {revealError}
                </p>
            ) : null}
        </>
    );
}
