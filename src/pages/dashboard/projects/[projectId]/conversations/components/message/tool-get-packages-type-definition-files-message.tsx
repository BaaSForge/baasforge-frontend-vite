import type { ReactNode } from "react";
import { useState } from "react";

import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/errors";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type PackageTypeDefinitionFilesEntry,
    type ToolGetPackagesTypeDefinitionFilesPayload,
} from "@/modules/project-chat/types";
import { usePackagesTypeDefinitionFilesQuery } from "@/modules/project-chat/queries";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolDetailModalExpandButton, ToolDetailModalLayout } from "./tool-detail-modal-shell";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const HEADER_TITLE = "Reading package type definitions";
const ARGS_MODAL_TITLE = "Package type definitions";

function getPackagesFromPayload(payload: unknown): string[] {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return [];
    const args = (payload as ToolGetPackagesTypeDefinitionFilesPayload).args;
    const packages = args?.packages;
    if (!Array.isArray(packages)) return [];
    return packages.filter((pkg): pkg is string => typeof pkg === "string" && pkg.trim() !== "");
}

function PackageBadgeRow({ packages }: { packages: string[] }) {
    if (packages.length === 0) return null;

    return (
        <div className="flex min-w-0 max-w-full flex-wrap gap-x-2 gap-y-2">
            {packages.map((pkg) => (
                <Badge
                    key={pkg}
                    variant="outline"
                    className="px-1.5 py-0 text-[11px] font-normal leading-tight text-foreground"
                >
                    {pkg}
                </Badge>
            ))}
        </div>
    );
}

function PackageTypeDefinitionFilesTable({ entry }: { entry: PackageTypeDefinitionFilesEntry }) {
    return (
        <div className="w-fit max-w-full min-w-0 overflow-x-auto rounded border">
            <Table unwrapped className="w-max max-w-full text-xs">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-7 px-1.5 py-0.5 text-xs font-medium">Path</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entry.files.length > 0 ? (
                        entry.files.map((filePath) => (
                            <TableRow key={filePath} className="border-b last:border-0">
                                <TableCell className="px-1.5 py-1 font-mono text-xs">{filePath}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="border-b last:border-0">
                            <TableCell className="px-1.5 py-1 text-xs text-muted-foreground">No files</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function PackagesTypeDefinitionsModalBody({ packages, open }: { packages: string[]; open: boolean }) {
    const { data, isLoading, isError, error } = usePackagesTypeDefinitionFilesQuery(packages, {
        enabled: open && packages.length > 0,
    });

    if (packages.length === 0) {
        return <p className="text-sm text-muted-foreground">No packages</p>;
    }

    if (isLoading) {
        return <ContentLoadingState label="Loading package type definitions…" />;
    }

    if (isError) {
        return (
            <ContentErrorState
                title="Failed to load package type definitions."
                subtitle={getApiErrorMessage(error)}
            />
        );
    }

    const entries = data?.package_type_definition_files ?? [];
    const unknownPackages = data?.unknown_packages ?? [];
    const payloadError = data?.error?.trim();

    if (entries.length === 0 && unknownPackages.length === 0) {
        return <p className="text-sm text-muted-foreground">No type definition files found.</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {payloadError != null && payloadError !== "" && (
                <ContentErrorState title="Package lookup issue" subtitle={payloadError} />
            )}
            {entries.map((entry) => (
                <div key={entry.package} className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-sm font-medium">{entry.package}</h3>
                    <PackageTypeDefinitionFilesTable entry={entry} />
                </div>
            ))}
            {unknownPackages.map((pkg) => (
                <div key={pkg} className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-sm font-medium">{pkg}</h3>
                    <p className="text-sm text-muted-foreground">Unknown package</p>
                </div>
            ))}
        </div>
    );
}

export function ToolGetPackagesTypeDefinitionFilesMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const [argsModalOpen, setArgsModalOpen] = useState(false);
    const packages = getPackagesFromPayload(message.payload);
    const packageCount = packages.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasContent = packageCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);

    const expandButton = (
        <ToolDetailModalExpandButton
            onClick={() => setArgsModalOpen(true)}
            ariaLabel={`View ${ARGS_MODAL_TITLE} details`}
        />
    );

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                <div className="flex min-w-0 max-w-full flex-col gap-1.5 py-3 pr-3">
                    <div className="flex min-w-0 items-center gap-1">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <span className={toolHeaderPrimaryTitleClassName(status, "sm-font-medium")}>{HEADER_TITLE}</span>
                            {hasContent ? (
                                <span className="text-xs text-muted-foreground">
                                    {packageCount} {packageCount === 1 ? "package" : "packages"}
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground">no content</span>
                            )}
                        </div>
                        {expandButton}
                    </div>
                    {hasContent && <PackageBadgeRow packages={packages} />}
                </div>
            </div>
            <ToolDetailModalLayout open={argsModalOpen} onOpenChange={setArgsModalOpen} title={ARGS_MODAL_TITLE}>
                <PackagesTypeDefinitionsModalBody packages={packages} open={argsModalOpen} />
            </ToolDetailModalLayout>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
