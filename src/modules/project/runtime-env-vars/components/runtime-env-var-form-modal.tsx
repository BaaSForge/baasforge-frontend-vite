"use client";

import { PlatformEnvironmentBadge } from "@/components/platform-environment-badge";
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
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { buildRuntimeEnvVarSaveItem } from "../build-save-item";
import { useSaveRuntimeEnvVarsMutation } from "../mutations";
import { sortRuntimesForEnvVars } from "../sort-runtimes";
import type { RuntimeEnvVarListItem } from "../types";
import {
    isValidRuntimeEnvVarKey,
    normalizeRuntimeEnvVarKey,
    RUNTIME_ENV_VAR_KEY_VALIDATION_MESSAGE,
    runtimeValuesFromListItem,
    sanitizeRuntimeEnvVarKeyInput,
} from "../types";

const RUNTIME_ENV_VAR_FORM_ID = "runtime-env-var-form";

const FORM_PLACEHOLDERS = {
    encrypted: {
        key: "e.g. WEBHOOK_SIGNING_SECRET",
        value: "e.g. whsec_…",
    },
    plain: {
        key: "e.g. EXTERNAL_CALLBACK_URL",
        value: "e.g. https://hooks.example.com/baasforge",
    },
} as const;

const RUNTIME_ENV_VAR_KEY_HINT =
    "Use a clear, human-readable key so AI can find out what this variable is for (e.g. WEBHOOK_SIGNING_SECRET, not WH_SS).";

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

function initialFormValues(initialRow: RuntimeEnvVarListItem | undefined, runtimeIds: readonly string[]): Record<string, string> {
    if (!initialRow) return emptyFormValues(runtimeIds);
    const fromRow = runtimeValuesFromListItem(initialRow, runtimeIds);
    return Object.fromEntries(
        runtimeIds.map((id) => {
            const v = fromRow[id];
            return [id, v === null ? "" : v];
        }),
    );
}

type RuntimeEnvVarFormContextValue = {
    isEncrypted: boolean;
    sortedRuntimes: ProjectRuntimeResponse[];
    key: string;
    setKey: (value: string) => void;
    values: Record<string, string>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
    const [values, setValues] = useState(() => initialFormValues(initialRow, runtimeIds));
    const [validationError, setValidationError] = useState<string | null>(null);
    const saveMutation = useSaveRuntimeEnvVarsMutation(projectId);

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
            const item = buildRuntimeEnvVarSaveItem(trimmedKey, isEncrypted, values, initialRow, runtimeIds);
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
        [key, runtimeIds, values, isEncrypted, initialRow, onClose, saveMutation],
    );

    const value = useMemo<RuntimeEnvVarFormContextValue>(
        () => ({
            isEncrypted,
            sortedRuntimes,
            key,
            setKey,
            values,
            setValues,
            validationError,
            saveMutation,
            title,
            isEdit,
            handleSubmit,
            onClose,
        }),
        [isEncrypted, sortedRuntimes, key, setKey, values, validationError, saveMutation, title, isEdit, handleSubmit, onClose],
    );

    return <RuntimeEnvVarFormContext.Provider value={value}>{children}</RuntimeEnvVarFormContext.Provider>;
}

function RuntimeEnvVarFormTitle() {
    const { title } = useRuntimeEnvVarFormContext();
    return <CentricModalTitle>{title}</CentricModalTitle>;
}

function RuntimeEnvVarFormFields() {
    const { isEncrypted, sortedRuntimes, key, setKey, values, setValues, validationError, saveMutation, isEdit, handleSubmit } =
        useRuntimeEnvVarFormContext();
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
                            disabled={saveMutation.isPending || isEdit}
                            readOnly={isEdit}
                            className="font-mono text-sm"
                            autoComplete="off"
                        />
                        {!isEdit ? <FieldDescription>{RUNTIME_ENV_VAR_KEY_HINT}</FieldDescription> : null}
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
                                <Input
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
                                    type="password"
                                    autoComplete="off"
                                    className="font-mono text-sm"
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
