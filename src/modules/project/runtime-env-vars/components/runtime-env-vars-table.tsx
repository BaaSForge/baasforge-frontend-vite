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
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteRuntimeEnvVarsMutation } from "../mutations";
import { useProjectRuntimeEnvVarsQuery } from "../queries";
import { sortRuntimesForEnvVars } from "../sort-runtimes";
import type { RuntimeEnvVarListItem } from "../types";
import { runtimeValueFromListItem } from "../types";
import { RuntimeEnvVarCell } from "./runtime-env-var-cell";
import { RuntimeEnvVarFormModal } from "./runtime-env-var-form-modal";

export type RuntimeEnvVarsTableProps = {
    title: string;
    projectId: string;
    isEncrypted: boolean;
    runtimes: ProjectRuntimeResponse[];
    runtimesLoading: boolean;
    runtimesError: boolean;
};

export function RuntimeEnvVarsTable({
    title,
    projectId,
    isEncrypted,
    runtimes,
    runtimesLoading,
    runtimesError,
}: RuntimeEnvVarsTableProps) {
    const sortedRuntimes = useMemo(() => sortRuntimesForEnvVars(runtimes), [runtimes]);
    const { data: rows = [], isLoading, error } = useProjectRuntimeEnvVarsQuery(projectId, isEncrypted);
    const deleteMutation = useDeleteRuntimeEnvVarsMutation(projectId);

    const [addOpen, setAddOpen] = useState(false);
    const [editRow, setEditRow] = useState<RuntimeEnvVarListItem | undefined>(undefined);

    const editOpen = editRow != null;
    const handleEditOpenChange = (open: boolean) => {
        if (!open) setEditRow(undefined);
    };

    const canAdd =
        sortedRuntimes.length > 0 && !runtimesLoading && !isLoading && !runtimesError && !error;

    const headerRow = (
        <div className="mb-3 flex items-center justify-between gap-2">
            <SectionTitle className="mb-0">{title}</SectionTitle>
            {canAdd ? (
                <Button type="button" size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
                    <Plus className="size-4" />
                    <span className="ml-1.5">Add variable</span>
                </Button>
            ) : null}
        </div>
    );

    if (runtimesLoading || isLoading) {
        return (
            <>
                {headerRow}
                <p className="text-muted-foreground py-6 text-center text-sm">Loading…</p>
            </>
        );
    }

    if (runtimesError || error) {
        return (
            <>
                {headerRow}
                <p className="text-destructive py-6 text-center text-sm">Failed to load environment variables.</p>
            </>
        );
    }

    if (sortedRuntimes.length === 0) {
        return (
            <>
                {headerRow}
                <p className="text-muted-foreground py-6 text-center text-sm">No runtimes in this project yet.</p>
            </>
        );
    }

    return (
        <>
            {headerRow}
            <div className="overflow-x-auto rounded-xl border bg-card">
                {rows.length === 0 ? (
                    <p className="text-muted-foreground px-4 py-8 text-center text-sm">No variables yet.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="sticky left-0 z-10 w-0 max-w-[10rem] bg-card ps-4">Key</TableHead>
                                {sortedRuntimes.map((runtime) => (
                                    <TableHead key={runtime.id} className="min-w-[12rem]">
                                        <span className="font-medium">{runtime.name}</span>
                                    </TableHead>
                                ))}
                                <TableHead className="w-[7rem] pe-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.key} className="group">
                                    <TableCell
                                        className="sticky left-0 z-10 w-0 max-w-[10rem] bg-card ps-4 font-mono text-xs font-medium truncate group-hover:bg-muted"
                                        title={row.key}
                                    >
                                        {row.key}
                                    </TableCell>
                                    {sortedRuntimes.map((runtime) => (
                                        <TableCell key={runtime.id}>
                                            <RuntimeEnvVarCell
                                                projectId={projectId}
                                                envKey={row.key}
                                                runtimeId={runtime.id}
                                                listValue={runtimeValueFromListItem(row, runtime.id)}
                                                isEncrypted={isEncrypted}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell className="pe-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => setEditRow(row)}
                                                aria-label={`Edit ${row.key}`}
                                            >
                                                <Pencil />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        aria-label={`Delete ${row.key}`}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete {row.key}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This removes the variable from every runtime. This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() =>
                                                                deleteMutation.mutate({ keys: [row.key] })
                                                            }
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
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
