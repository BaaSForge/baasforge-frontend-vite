"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePatchProjectMutation, useProjectQuery } from "@/modules/project";
import { useState } from "react";
import { useParams } from "react-router";

function formatValue(value: string): string {
    return value || "—";
}

export default function ProjectSettingsInfoPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const id = projectId ?? undefined;
    const { data: project, isLoading } = useProjectQuery(id);
    const patchMutation = usePatchProjectMutation(id ?? "");
    const [editedName, setEditedName] = useState<string | null>(null);
    const name = editedName ?? project?.name ?? "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id == null || name.trim() === "") return;
        patchMutation.mutate({ name: name.trim() }, { onSuccess: () => setEditedName(null) });
    };

    if (isLoading) {
        return <p className="text-muted-foreground text-sm">Loading project…</p>;
    }
    if (!project) {
        return <p className="text-muted-foreground text-sm">Project not found.</p>;
    }

    const isDirty = name.trim() !== (project.name ?? "");

    return (
        <div className="rounded-xl border bg-card p-4 max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <FieldContent>
                            <Input
                                value={name}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Project name"
                                disabled={patchMutation.isPending}
                                aria-invalid={patchMutation.isError ? true : undefined}
                            />
                        </FieldContent>
                    </Field>
                    <ReadOnlyField label="Slug" value={project.slug} />
                </FieldGroup>
                <div className="flex justify-end">
                    <Button type="submit" disabled={!isDirty || patchMutation.isPending}>
                        {patchMutation.isPending ? "Updating…" : "Update"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <Field>
            <FieldTitle>{label}</FieldTitle>
            <FieldContent>
                <Input value={formatValue(value)} disabled className="bg-muted" />
            </FieldContent>
        </Field>
    );
}
