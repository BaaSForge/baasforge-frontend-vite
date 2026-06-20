"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getApiErrorMessage } from "@/lib/errors";
import { nameToSlug } from "@/utils";
import { Lock, LockOpen } from "lucide-react";
import { useCallback, useState } from "react";
import { useCreateProjectMutation } from "../mutations";

export const APP_CREATE_PROJECT_FORM_ID = "app-create-project-form";

export interface CreateProjectFormProps {
    className?: string;
    redirectOnSuccess?: boolean;
    onSuccess?: (projectId: string) => void;
}

export function CreateProjectForm({ className, redirectOnSuccess = true, onSuccess }: CreateProjectFormProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugLocked, setSlugLocked] = useState(true); // locked = read-only + auto-generated

    const mutation = useCreateProjectMutation({
        redirect: redirectOnSuccess,
        onSuccess,
    });

    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const next = e.target.value;
            setName(next);
            if (slugLocked) {
                setSlug(nameToSlug(next));
            }
        },
        [slugLocked],
    );

    const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
    }, []);

    const handleLockToggle = useCallback(() => {
        if (slugLocked) {
            setSlugLocked(false);
        } else {
            setSlug(nameToSlug(name));
            setSlugLocked(true);
        }
    }, [name, slugLocked]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedSlug = slug.trim();
        if (!trimmedName || !trimmedSlug) return;
        mutation.mutate({
            name: trimmedName,
            slug: trimmedSlug,
        });
    };

    const slugLockTooltip = slugLocked ? "Unlock to edit slug manually" : "Lock to auto-generate slug from name";

    return (
        <form id={APP_CREATE_PROJECT_FORM_ID} onSubmit={handleSubmit} className={className}>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="create-project-name">Name</FieldLabel>
                    <FieldContent>
                        <Input
                            id="create-project-name"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="My Project"
                            disabled={mutation.isPending}
                            aria-invalid={mutation.isError ? true : undefined}
                            autoComplete="off"
                        />
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel htmlFor="create-project-slug">Slug</FieldLabel>
                    <FieldContent>
                        <InputGroup>
                            <InputGroupInput
                                id="create-project-slug"
                                value={slug}
                                onChange={handleSlugChange}
                                readOnly={slugLocked}
                                placeholder="my-project"
                                disabled={mutation.isPending}
                                aria-invalid={mutation.isError ? true : undefined}
                                autoComplete="off"
                                className="font-mono text-sm"
                            />
                            <InputGroupAddon align="inline-end">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <InputGroupButton
                                            type="button"
                                            size="icon-xs"
                                            variant="secondary"
                                            className="bg-muted hover:bg-muted/80"
                                            onClick={handleLockToggle}
                                            disabled={mutation.isPending}
                                            aria-label={slugLockTooltip}
                                        >
                                            {slugLocked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                                        </InputGroupButton>
                                    </TooltipTrigger>
                                    <TooltipContent>{slugLockTooltip}</TooltipContent>
                                </Tooltip>
                            </InputGroupAddon>
                        </InputGroup>
                    </FieldContent>
                </Field>
            </FieldGroup>
            {mutation.isError && (
                <p className="text-destructive text-sm mt-2" role="alert">
                    {getApiErrorMessage(mutation.error)}
                </p>
            )}
            <div className="flex justify-end mt-6">
                <Button type="submit" disabled={mutation.isPending || !name.trim() || !slug.trim()}>
                    {mutation.isPending ? "Creating…" : "Create project"}
                </Button>
            </div>
        </form>
    );
}
