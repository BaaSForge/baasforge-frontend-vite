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
import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { PlatformEnvironmentBadge } from "@/components/platform-environment-badge";
import { CodeSnippetActions } from "@/components/syntax-highlight/code-snippet-actions";
import { Button } from "@/components/ui/button";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteRuntimeEnvVarsMutation } from "../mutations";
import { useProjectRuntimeEnvVarsQuery } from "../queries";
import { sortRuntimesForEnvVars } from "../sort-runtimes";
import type { RuntimeEnvVarListItem } from "../types";
import { runtimeValueFromListItem } from "../types";
import { RuntimeEnvVarCell } from "./runtime-env-var-cell";
import { RuntimeEnvVarFormModal } from "./runtime-env-var-form-modal";

export type RuntimeEnvVarsTableProps = {
    projectId: string;
    isEncrypted: boolean;
    runtimes: ProjectRuntimeResponse[];
};

type RuntimeEnvVarRowProps = {
    row: RuntimeEnvVarListItem;
    projectId: string;
    isEncrypted: boolean;
    sortedRuntimes: ProjectRuntimeResponse[];
    onEdit: () => void;
    onDelete: () => void;
    deletePending: boolean;
};

function RuntimeEnvVarRow({
    row,
    projectId,
    isEncrypted,
    sortedRuntimes,
    onEdit,
    onDelete,
    deletePending,
}: RuntimeEnvVarRowProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-4 py-3">
                <p className="min-w-0 font-mono text-sm font-semibold tracking-tight truncate" title={row.key}>
                    {row.key}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                    <CodeSnippetActions textToCopy={row.key} tooltip="Copy key" />
                    <Button type="button" variant="ghost" size="icon-xs" onClick={onEdit} aria-label={`Edit ${row.key}`}>
                        <Pencil />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Delete ${row.key}`}
                                disabled={deletePending}
                            >
                                <Trash2 className="text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader className="min-w-0">
                                <AlertDialogTitle className="flex min-w-0 items-baseline">
                                    <span className="mr-1 shrink-0">Delete</span>
                                    <span className="flex min-w-0 flex-1 items-baseline overflow-hidden">
                                        <span className="min-w-0 truncate font-mono" title={row.key}>
                                            {row.key}
                                        </span>
                                        <span className="shrink-0">?</span>
                                    </span>
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This removes the variable from every runtime. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={onDelete}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <ul className="flex flex-col gap-2 p-3">
                {sortedRuntimes.map((runtime) => (
                    <li
                        key={runtime.id}
                        className="grid min-w-0 gap-2 rounded-lg border border-border/50 bg-muted/15 p-3 sm:grid-cols-[minmax(0,10.5rem)_1fr] sm:items-center sm:gap-4"
                    >
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate text-sm font-medium" title={runtime.name}>
                                {runtime.name}
                            </span>
                            <PlatformEnvironmentBadge environment={runtime.environment} className="w-fit text-xs" />
                        </div>
                        <div className="flex w-full min-w-0 items-center justify-end sm:w-auto">
                            <RuntimeEnvVarCell
                                projectId={projectId}
                                envKey={row.key}
                                runtimeId={runtime.id}
                                listValue={runtimeValueFromListItem(row, runtime.id)}
                                isEncrypted={isEncrypted}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function RuntimeEnvVarsTable({ projectId, isEncrypted, runtimes }: RuntimeEnvVarsTableProps) {
    const sortedRuntimes = useMemo(() => sortRuntimesForEnvVars(runtimes), [runtimes]);
    const { data: rows = [], isLoading, error } = useProjectRuntimeEnvVarsQuery(projectId, isEncrypted);
    const deleteMutation = useDeleteRuntimeEnvVarsMutation(projectId);

    const [addOpen, setAddOpen] = useState(false);
    const [editRow, setEditRow] = useState<RuntimeEnvVarListItem | undefined>(undefined);

    const editOpen = editRow != null;
    const handleEditOpenChange = (open: boolean) => {
        if (!open) setEditRow(undefined);
    };

    const canAdd = sortedRuntimes.length > 0 && !isLoading && !error;

    const headerRow = canAdd ? (
        <div className="mb-3 flex justify-end">
            <Button type="button" size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                <span className="ml-1.5">Add variable</span>
            </Button>
        </div>
    ) : null;

    if (isLoading) {
        return (
            <>
                {headerRow}
                <ContentLoadingState label="Loading variables…" />
            </>
        );
    }

    if (error) {
        return (
            <>
                {headerRow}
                <ContentErrorState
                    title="Failed to load variables"
                    subtitle="Try refreshing the page and try again."
                />
            </>
        );
    }

    return (
        <>
            {headerRow}
            {rows.length === 0 ? (
                <ContentEmptyState
                    title="No variables yet"
                    description="Add a variable to configure values across runtimes."
                    icon={KeyRound}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {rows.map((row) => (
                        <RuntimeEnvVarRow
                            key={row.key}
                            row={row}
                            projectId={projectId}
                            isEncrypted={isEncrypted}
                            sortedRuntimes={sortedRuntimes}
                            onEdit={() => setEditRow(row)}
                            onDelete={() => deleteMutation.mutate({ keys: [row.key] })}
                            deletePending={deleteMutation.isPending}
                        />
                    ))}
                </div>
            )}
            <RuntimeEnvVarFormModal
                projectId={projectId}
                open={addOpen}
                onOpenChange={setAddOpen}
                isEncrypted={isEncrypted}
                runtimes={runtimes}
            />
            <RuntimeEnvVarFormModal
                projectId={projectId}
                open={editOpen}
                onOpenChange={handleEditOpenChange}
                isEncrypted={isEncrypted}
                runtimes={runtimes}
                initialRow={editRow}
            />
        </>
    );
}
