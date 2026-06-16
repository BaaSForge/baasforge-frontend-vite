"use client";

import { PlatformEnvironmentBadge } from "@/components/platform-environment-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/errors";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { buildRuntimeEnvVarSaveItem } from "../build-save-item";
import { useSaveRuntimeEnvVarsMutation } from "../mutations";
import { sortRuntimesForEnvVars } from "../sort-runtimes";
import type { RuntimeEnvVarListItem } from "../types";
import {
    isValidRuntimeEnvVarKey,
    normalizeRuntimeEnvVarKey,
    RUNTIME_ENV_VAR_KEY_VALIDATION_MESSAGE,
    runtimeHasConfiguredValue,
    runtimeValuesFromListItem,
    sanitizeRuntimeEnvVarKeyInput,
} from "../types";
import { EncryptedRuntimeEnvVarValueField } from "./encrypted-runtime-env-var-value-field";

const RUNTIME_ENV_VAR_FORM_ID = "runtime-env-var-form";

const FORM_PLACEHOLDERS = {
    encrypted: {
        key: "WEBHOOK_SIGNING_SECRET",
        value: "Type or paste",
    },
    plain: {
        key: "EXTERNAL_CALLBACK_URL",
        value: "https://…",
    },
} as const;

const RUNTIME_ENV_VAR_KEY_HINT =
    "Use a clear, human-readable key so AI can find out what this variable is for (e.g. WEBHOOK_SIGNING_SECRET, not WH_SS).";

const ENCRYPTED_VALUE_ADD_ALERT = "Type or paste. Reveal to preview.";
const ENCRYPTED_VALUE_EDIT_ALERT = "Paste while hidden, or reveal to type.";
const ENCRYPTED_VALUE_EDIT_ALERT_SUFFIX = " Empty keeps the current value.";

export type RuntimeEnvVarFormModalProps = {
    projectId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEncrypted: boolean;
    runtimes: ProjectRuntimeResponse[];
    initialRow?: RuntimeEnvVarListItem;
};

function emptyFormValues(runtimeIds: readonly string[]): Record<string, string> {
    return Object.fromEntries(runtimeIds.map((id) => [id, ""]));
}

function initialFormValues(
    initialRow: RuntimeEnvVarListItem | undefined,
    runtimeIds: readonly string[],
    isEncrypted: boolean,
): Record<string, string> {
    if (!initialRow || isEncrypted) return emptyFormValues(runtimeIds);
    const fromRow = runtimeValuesFromListItem(initialRow, runtimeIds);
    return Object.fromEntries(
        runtimeIds.map((id) => {
            const v = fromRow[id];
            return [id, v === null ? "" : v];
        }),
    );
}

type RuntimeEnvVarFormContextValue = {
    projectId: string;
    isEncrypted: boolean;
    sortedRuntimes: ProjectRuntimeResponse[];
    key: string;
    setKey: (value: string) => void;
    values: Record<string, string>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    encryptedTouchedRuntimes: ReadonlySet<string>;
    markEncryptedRuntimeTouched: (runtimeId: string) => void;
    clearEncryptedRuntimeTouched: (runtimeId: string) => void;
    initialRow?: RuntimeEnvVarListItem;
    validationError: string | null;
    saveMutation: ReturnType<typeof useSaveRuntimeEnvVarsMutation>;
    title: string;
    isEdit: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
};

const RuntimeEnvVarFormContext = createContext<RuntimeEnvVarFormContextValue | null>(null);

function useRuntimeEnvVarFormContext(): RuntimeEnvVarFormContextValue {
    const ctx = useContext(RuntimeEnvVarFormContext);
    if (ctx == null) {
        throw new Error("RuntimeEnvVarFormContext is missing");
    }
    return ctx;
}

type RuntimeEnvVarFormProviderProps = {
    projectId: string;
    isEncrypted: boolean;
    runtimes: ProjectRuntimeResponse[];
    initialRow?: RuntimeEnvVarListItem;
    onClose: () => void;
    children: ReactNode;
};

function RuntimeEnvVarFormProvider({ projectId, isEncrypted, runtimes, initialRow, onClose, children }: RuntimeEnvVarFormProviderProps) {
    const sortedRuntimes = useMemo(() => sortRuntimesForEnvVars(runtimes), [runtimes]);
    const runtimeIds = useMemo(() => sortedRuntimes.map((r) => r.id), [sortedRuntimes]);
    const isEdit = initialRow != null;

    const [key, setKeyState] = useState(() => initialRow?.key ?? "");
    const [values, setValues] = useState(() => initialFormValues(initialRow, runtimeIds, isEncrypted));
    const [encryptedTouchedRuntimes, setEncryptedTouchedRuntimes] = useState<ReadonlySet<string>>(() => new Set());
    const [validationError, setValidationError] = useState<string | null>(null);
    const saveMutation = useSaveRuntimeEnvVarsMutation(projectId);

    const markEncryptedRuntimeTouched = useCallback((runtimeId: string) => {
        setEncryptedTouchedRuntimes((current) => {
            if (current.has(runtimeId)) return current;
            return new Set(current).add(runtimeId);
        });
    }, []);

    const clearEncryptedRuntimeTouched = useCallback((runtimeId: string) => {
        setEncryptedTouchedRuntimes((current) => {
            if (!current.has(runtimeId)) return current;
            const next = new Set(current);
            next.delete(runtimeId);
            return next;
        });
    }, []);

    const setKey = useCallback((value: string) => {
        setKeyState(sanitizeRuntimeEnvVarKeyInput(value));
        setValidationError(null);
    }, []);

    const title = isEdit ? `Edit ${isEncrypted ? "encrypted" : "non-encrypted"} variable` : `Add ${isEncrypted ? "encrypted" : "non-encrypted"} variable`;

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmedKey = normalizeRuntimeEnvVarKey(key);
            if (!trimmedKey) return;

            if (!isValidRuntimeEnvVarKey(trimmedKey)) {
                setValidationError(RUNTIME_ENV_VAR_KEY_VALIDATION_MESSAGE);
                return;
            }

            setValidationError(null);
            const item = buildRuntimeEnvVarSaveItem(
                trimmedKey,
                isEncrypted,
                values,
                initialRow,
                runtimeIds,
                isEncrypted ? encryptedTouchedRuntimes : undefined,
            );
            if (item == null) {
                onClose();
                return;
            }

            saveMutation.mutate(
                { items: [item] },
                {
                    onSuccess: () => onClose(),
                },
            );
        },
        [key, runtimeIds, values, isEncrypted, initialRow, onClose, saveMutation, encryptedTouchedRuntimes],
    );

    const value = useMemo<RuntimeEnvVarFormContextValue>(
        () => ({
            projectId,
            isEncrypted,
            sortedRuntimes,
            key,
            setKey,
            values,
            setValues,
            encryptedTouchedRuntimes,
            markEncryptedRuntimeTouched,
            clearEncryptedRuntimeTouched,
            initialRow,
            validationError,
            saveMutation,
            title,
            isEdit,
            handleSubmit,
            onClose,
        }),
        [projectId, isEncrypted, sortedRuntimes, key, setKey, values, encryptedTouchedRuntimes, markEncryptedRuntimeTouched, clearEncryptedRuntimeTouched, initialRow, validationError, saveMutation, title, isEdit, handleSubmit, onClose],
    );

    return <RuntimeEnvVarFormContext.Provider value={value}>{children}</RuntimeEnvVarFormContext.Provider>;
}

function RuntimeEnvVarFormTitle() {
    const { title } = useRuntimeEnvVarFormContext();
    return <CentricModalTitle>{title}</CentricModalTitle>;
}

function RuntimeEnvVarFormFields() {
    const {
        projectId,
        isEncrypted,
        isEdit,
        sortedRuntimes,
        key,
        setKey,
        values,
        setValues,
        markEncryptedRuntimeTouched,
        clearEncryptedRuntimeTouched,
        initialRow,
        validationError,
        saveMutation,
        handleSubmit,
    } = useRuntimeEnvVarFormContext();
    const placeholders = isEncrypted ? FORM_PLACEHOLDERS.encrypted : FORM_PLACEHOLDERS.plain;

    return (
        <form id={RUNTIME_ENV_VAR_FORM_ID} onSubmit={handleSubmit} className="pb-2 md:pt-2">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="runtime-env-var-key">Key</FieldLabel>
                    <FieldContent>
                        <Input
                            id="runtime-env-var-key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={placeholders.key}
                            disabled={saveMutation.isPending}
                            className="font-mono text-sm"
                            autoComplete="off"
                        />
                        <FieldDescription>{RUNTIME_ENV_VAR_KEY_HINT}</FieldDescription>
                        {isEncrypted ? (
                            <Alert className="mt-3">
                                <Info />
                                <AlertDescription>
                                    {isEdit ? ENCRYPTED_VALUE_EDIT_ALERT : ENCRYPTED_VALUE_ADD_ALERT}
                                    {isEdit ? ENCRYPTED_VALUE_EDIT_ALERT_SUFFIX : null}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                    </FieldContent>
                </Field>
                {sortedRuntimes.map((runtime) => (
                    <Field key={runtime.id}>
                        <FieldLabel htmlFor={`runtime-env-${runtime.id}`}>
                            <span className="flex flex-wrap items-center gap-2">
                                <span>{runtime.name}</span>
                                <PlatformEnvironmentBadge environment={runtime.environment} />
                            </span>
                        </FieldLabel>
                        <FieldContent>
                            {isEncrypted ? (
                                <EncryptedRuntimeEnvVarValueField
                                    id={`runtime-env-${runtime.id}`}
                                    value={values[runtime.id] ?? ""}
                                    onChange={(next) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [runtime.id]: next,
                                        }))
                                    }
                                    onTouched={() => markEncryptedRuntimeTouched(runtime.id)}
                                    onRevealedFromServer={() => clearEncryptedRuntimeTouched(runtime.id)}
                                    placeholder={placeholders.value}
                                    disabled={saveMutation.isPending}
                                    isEdit={isEdit}
                                    hasExistingValue={isEdit && initialRow != null && runtimeHasConfiguredValue(initialRow, runtime.id)}
                                    revealContext={
                                        isEdit && initialRow != null
                                            ? {
                                                  projectId,
                                                  envKey: normalizeRuntimeEnvVarKey(initialRow.key),
                                                  runtimeId: runtime.id,
                                              }
                                            : undefined
                                    }
                                />
                            ) : (
                                <Textarea
                                    id={`runtime-env-${runtime.id}`}
                                    value={values[runtime.id] ?? ""}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [runtime.id]: e.target.value,
                                        }))
                                    }
                                    placeholder={placeholders.value}
                                    disabled={saveMutation.isPending}
                                    autoComplete="off"
                                    rows={4}
                                    className="font-mono text-sm"
                                />
                            )}
                        </FieldContent>
                    </Field>
                ))}
            </FieldGroup>
            {validationError ? (
                <p className="text-destructive mt-2 text-sm" role="alert">
                    {validationError}
                </p>
            ) : null}
            {saveMutation.isError ? (
                <p className="text-destructive mt-2 text-sm" role="alert">
                    {getApiErrorMessage(saveMutation.error)}
                </p>
            ) : null}
        </form>
    );
}

function RuntimeEnvVarFormActions() {
    const { key, saveMutation, isEdit, onClose } = useRuntimeEnvVarFormContext();
    const canSubmit = key.trim().length > 0 && isValidRuntimeEnvVarKey(key);

    return (
        <>
            <Button type="button" variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
                Cancel
            </Button>
            <Button type="submit" form={RUNTIME_ENV_VAR_FORM_ID} disabled={saveMutation.isPending || !canSubmit}>
                {saveMutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add variable"}
            </Button>
        </>
    );
}

export function RuntimeEnvVarFormModal({
    projectId,
    open,
    onOpenChange,
    isEncrypted,
    runtimes,
    initialRow,
}: RuntimeEnvVarFormModalProps) {
    const formKey = initialRow?.key ?? "__add__";

    return (
        <RuntimeEnvVarFormProvider
            key={open ? formKey : "closed"}
            projectId={projectId}
            isEncrypted={isEncrypted}
            runtimes={runtimes}
            initialRow={initialRow}
            onClose={() => onOpenChange(false)}
        >
            <CentricModal open={open} onOpenChange={onOpenChange}>
                <CentricModalContent
                    fillViewportOnMobile
                    footerShellClassName="pt-1.5 pb-3 sm:pb-3.5"
                    className="gap-0 overflow-hidden p-0 sm:max-w-lg"
                >
                    {open ? (
                        <CentricModalHeader>
                            <RuntimeEnvVarFormTitle />
                        </CentricModalHeader>
                    ) : null}
                    {open ? <RuntimeEnvVarFormFields /> : null}
                    {open ? (
                        <CentricModalFooter className="flex justify-end gap-2 py-2 sm:justify-end md:py-0">
                            <RuntimeEnvVarFormActions />
                        </CentricModalFooter>
                    ) : null}
                </CentricModalContent>
            </CentricModal>
        </RuntimeEnvVarFormProvider>
    );
}
