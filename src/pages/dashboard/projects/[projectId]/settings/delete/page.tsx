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
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDeleteProjectMutation, useProjectQuery } from "@/modules/project";
import { useState } from "react";
import { useParams } from "react-router";

const CONFIRM_PLACEHOLDER = "Type the project name to confirm";

export default function ProjectSettingsDeletePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const id = projectId ?? undefined;
    const { data: project, isLoading } = useProjectQuery(id);
    const deleteMutation = useDeleteProjectMutation(id ?? "");
    const [confirmValue, setConfirmValue] = useState("");
    const [open, setOpen] = useState(false);

    const projectName = project?.name ?? "";
    const isConfirmValid = confirmValue.trim() === projectName;
    const canDelete = isConfirmValid && !deleteMutation.isPending;

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) setConfirmValue("");
    };

    const handleConfirm = () => {
        if (!canDelete) return;
        deleteMutation.mutate();
        setOpen(false);
    };

    if (isLoading) {
        return <p className="text-muted-foreground text-sm">Loading project…</p>;
    }
    if (!project) {
        return <p className="text-muted-foreground text-sm">Project not found.</p>;
    }

    return (
        <div className="rounded-xl border border-destructive/50 bg-card p-4 max-w-lg">
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-destructive font-semibold">Danger zone</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Once you delete this project, there is no going back. All data associated with this project will be permanently removed.
                    </p>
                </div>
                <AlertDialog open={open} onOpenChange={handleOpenChange}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                            Delete this project
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the project <strong>{projectName}</strong> and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Field className="pt-2">
                            <FieldLabel htmlFor="confirm-project-name">
                                Type <strong>{projectName}</strong> to confirm
                            </FieldLabel>
                            <FieldContent>
                                <Input
                                    id="confirm-project-name"
                                    value={confirmValue}
                                    onChange={(e) => setConfirmValue(e.target.value)}
                                    placeholder={CONFIRM_PLACEHOLDER}
                                    disabled={deleteMutation.isPending}
                                    className="font-mono"
                                    aria-invalid={confirmValue.length > 0 && !isConfirmValid}
                                />
                            </FieldContent>
                        </Field>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleConfirm();
                                }}
                                disabled={!canDelete}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? "Deleting…" : "Delete project"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
