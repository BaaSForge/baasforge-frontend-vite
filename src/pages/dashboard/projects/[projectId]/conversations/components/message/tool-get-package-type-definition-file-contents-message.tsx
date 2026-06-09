import type { ReactNode } from "react";
import { useState } from "react";

import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/errors";
import { UnitExplanationCurrentViewer } from "@/modules/project-chat/components/unit-explanation-current-viewer";
import { usePackageTypeDefinitionFileContentsQuery } from "@/modules/project-chat/queries";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type PackageTypeDefinitionFileContentEntry,
    type ToolGetPackageTypeDefinitionFileContentsPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolDetailModalExpandButton, ToolDetailModalLayout } from "./tool-detail-modal-shell";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

const HEADER_TITLE = "Reading package type definition file contents";
const ARGS_MODAL_TITLE = "Package type definition file contents";

function getFilesFromPayload(payload: unknown): string[] {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) return [];
    const args = (payload as ToolGetPackageTypeDefinitionFileContentsPayload).args;
    const files = args?.files;
    if (!Array.isArray(files)) return [];
    return files.filter((filePath): filePath is string => typeof filePath === "string" && filePath.trim() !== "");
}

function FilePathsTable({ filePaths }: { filePaths: string[] }) {
    if (filePaths.length === 0) return null;

    return (
        <div className="w-fit max-w-full min-w-0 overflow-x-auto rounded border">
            <Table unwrapped className="w-max max-w-full text-xs">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-7 px-1.5 py-0.5 text-xs font-medium">Path</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filePaths.map((filePath) => (
                        <TableRow key={filePath} className="border-b last:border-0">
                            <TableCell className="px-1.5 py-1 font-mono text-xs">{filePath}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PackageTypeDefinitionFileContentBlock({ entry }: { entry: PackageTypeDefinitionFileContentEntry }) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <h3 className="font-mono text-sm font-medium">{entry.path}</h3>
            <UnitExplanationCurrentViewer code={entry.content} language="typescript" plainText={false} />
        </div>
    );
}

function PackageTypeDefinitionFileContentsModalBody({ files, open }: { files: string[]; open: boolean }) {
    const { data, isLoading, isError, error } = usePackageTypeDefinitionFileContentsQuery(files, {
        enabled: open && files.length > 0,
    });

    if (files.length === 0) {
        return <p className="text-sm text-muted-foreground">No files</p>;
    }

    if (isLoading) {
        return <ContentLoadingState label="Loading file contents…" />;
    }

    if (isError) {
        return (
            <ContentErrorState
                title="Failed to load file contents."
                subtitle={getApiErrorMessage(error)}
            />
        );
    }

    const entries = data?.package_type_definition_file_contents ?? [];
    const unknownFiles = data?.unknown_files ?? [];
    const payloadError = data?.error?.trim();

    if (entries.length === 0 && unknownFiles.length === 0) {
        return <p className="text-sm text-muted-foreground">No file contents found.</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {payloadError != null && payloadError !== "" && (
                <ContentErrorState title="File lookup issue" subtitle={payloadError} />
            )}
            {entries.map((entry) => (
                <PackageTypeDefinitionFileContentBlock key={entry.path} entry={entry} />
            ))}
            {unknownFiles.map((filePath) => (
                <div key={filePath} className="flex min-w-0 flex-col gap-2">
                    <h3 className="font-mono text-sm font-medium">{filePath}</h3>
                    <p className="text-sm text-muted-foreground">Unknown file</p>
                </div>
            ))}
        </div>
    );
}

export function ToolGetPackageTypeDefinitionFileContentsMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const [argsModalOpen, setArgsModalOpen] = useState(false);
    const files = getFilesFromPayload(message.payload);
    const fileCount = files.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasContent = fileCount > 0;
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
                                    {fileCount} {fileCount === 1 ? "file" : "files"}
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground">no content</span>
                            )}
                        </div>
                        {expandButton}
                    </div>
                    {hasContent && <FilePathsTable filePaths={files} />}
                </div>
            </div>
            <ToolDetailModalLayout open={argsModalOpen} onOpenChange={setArgsModalOpen} title={ARGS_MODAL_TITLE}>
                <PackageTypeDefinitionFileContentsModalBody files={files} open={argsModalOpen} />
            </ToolDetailModalLayout>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
