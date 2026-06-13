"use client";

import { ContentErrorState } from "@/components/content-error-state";
import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Button } from "@/components/ui/button";
import { ReleaseUnitsAllPanel } from "@/modules/project/release-units-all/release-units-all-panel";
import { ShareProjectRuntimeProvider } from "@/modules/project/documentation-share/share-project-runtime-context";
import { SharedDocumentationUnitRow } from "@/modules/project/documentation-share/shared-documentation-unit-row";
import type { ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router";

function DocumentationSharePageShell({ children }: { children: ReactNode }) {
    return (
        <div className="bg-background min-h-svh">
            <header className="bg-background/90 supports-backdrop-filter:bg-background/75 sticky top-0 z-50 border-b backdrop-blur">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2.5">
                        <AppLogoSquare className="size-8" />
                        <span className="text-base font-semibold tracking-tight">BaaS Forge</span>
                    </Link>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/login">Login</Link>
                    </Button>
                </div>
            </header>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
    );
}

export default function DocumentationSharePage() {
    const { projectId, releaseId } = useParams<{ projectId: string; releaseId: string }>();
    const [searchParams] = useSearchParams();
    const shareSecret = searchParams.get("share-secret")?.trim() ?? "";

    if (projectId == null || releaseId == null) {
        return (
            <DocumentationSharePageShell>
                <ContentErrorState title="Invalid link" subtitle="This documentation share link is malformed." />
            </DocumentationSharePageShell>
        );
    }

    if (shareSecret.length === 0) {
        return (
            <DocumentationSharePageShell>
                <ContentErrorState
                    title="Missing share secret"
                    subtitle="Add the share secret to the URL query string to view this documentation."
                />
            </DocumentationSharePageShell>
        );
    }

    return (
        <DocumentationSharePageShell>
            <ShareProjectRuntimeProvider projectId={projectId} shareSecret={shareSecret}>
                <ReleaseUnitsAllPanel
                    projectId={projectId}
                    releaseId={releaseId}
                    shareSecret={shareSecret}
                    releaseIsLive
                    renderUnitCard={(unit) => <SharedDocumentationUnitRow projectId={projectId} unit={unit} />}
                />
            </ShareProjectRuntimeProvider>
        </DocumentationSharePageShell>
    );
}
