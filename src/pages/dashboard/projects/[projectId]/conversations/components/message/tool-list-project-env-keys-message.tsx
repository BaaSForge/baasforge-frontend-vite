import type { ReactNode } from "react";
import { ChevronDownIcon, Lock, LockOpen, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    ChatMessageStatus,
    getToolPayloadErrorString,
    type ChatMessageWithDeliveryStatus,
    type RuntimeEnvKeySummary,
    type ToolListProjectEnvKeysPayload,
} from "@/modules/project-chat/types";

import { InvokedMessageConnector } from "./invoked-message-connector";
import { toolHeaderPrimaryTitleClassName } from "./tool-header-generating-text";
import { AiMessageStatusIcon } from "./message-icons";
import { ToolMessagePayloadError } from "./tool-message-payload-error";

function normalizeRuntimeEnvKeySummary(entry: unknown): RuntimeEnvKeySummary | null {
    if (entry == null || typeof entry !== "object" || Array.isArray(entry)) return null;
    const key = (entry as { key?: unknown }).key;
    if (typeof key !== "string" || key.trim() === "") return null;
    const isEncrypted = (entry as { is_encrypted?: unknown }).is_encrypted;
    return { key, is_encrypted: isEncrypted === true };
}

function getEnvVarsFromPayload(payload: unknown): RuntimeEnvKeySummary[] {
    if (payload == null) return [];
    if (Array.isArray(payload)) {
        return payload
            .map((entry) => {
                if (typeof entry === "string" && entry.trim() !== "") {
                    return { key: entry, is_encrypted: false };
                }
                return normalizeRuntimeEnvKeySummary(entry);
            })
            .filter((entry): entry is RuntimeEnvKeySummary => entry != null);
    }
    if (typeof payload !== "object") return [];
    const envVars = (payload as ToolListProjectEnvKeysPayload).env_vars;
    if (!Array.isArray(envVars)) return [];
    return envVars
        .map((entry) => normalizeRuntimeEnvKeySummary(entry))
        .filter((entry): entry is RuntimeEnvKeySummary => entry != null);
}

function EnvVarBadgeRow({
    title,
    icon: Icon,
    envVars,
}: {
    title: string;
    icon: LucideIcon;
    envVars: RuntimeEnvKeySummary[];
}) {
    if (envVars.length === 0) return null;

    return (
        <div className="flex min-w-0 max-w-full flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden />
                <span>{title}</span>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap gap-x-2 gap-y-2">
                {envVars.map((envVar) => (
                    <Badge
                        key={envVar.key}
                        variant="outline"
                        className="px-1.5 py-0 text-[11px] font-normal leading-tight text-foreground"
                    >
                        {envVar.key}
                    </Badge>
                ))}
            </div>
        </div>
    );
}

export function ToolListProjectEnvKeysMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const envVars = getEnvVarsFromPayload(message.payload);
    const plainEnvVars = envVars.filter((v) => !v.is_encrypted);
    const encryptedEnvVars = envVars.filter((v) => v.is_encrypted);
    const envVarCount = envVars.length;
    const status = message.status ?? ChatMessageStatus.Generating;
    const hasContent = envVarCount > 0;
    const showInvokedConnector = Boolean(message.invoking_message_id);
    const payloadError = getToolPayloadErrorString(message.payload, message.payload_raw);

    return (
        <>
            <div className="relative flex w-full min-w-0 max-w-full justify-start overflow-hidden">
                {showInvokedConnector && <InvokedMessageConnector />}
                {!hasContent ? (
                    <div className="flex max-w-full items-center gap-2 rounded-md py-3 pr-3 text-left">
                        <span className="shrink-0">
                            <AiMessageStatusIcon status={status} />
                        </span>
                        <span className={toolHeaderPrimaryTitleClassName(status, "sm-font-medium")}>Reading project env keys</span>
                        <span className="text-xs text-muted-foreground">no content</span>
                    </div>
                ) : (
                    <Collapsible defaultOpen className="group/tool-list-project-env-keys w-full min-w-0 max-w-full overflow-hidden">
                        <CollapsibleTrigger className="flex items-center gap-2 rounded-md py-3 pr-3 text-left outline-none transition-all hover:bg-muted/50 hover:pl-3">
                            <span className="shrink-0">
                                <AiMessageStatusIcon status={status} />
                            </span>
                            <span className={toolHeaderPrimaryTitleClassName(status, "sm-font-medium")}>Reading project env keys</span>
                            <span className="text-xs text-muted-foreground">
                                {envVarCount} {envVarCount === 1 ? "variable" : "variables"}
                            </span>
                            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-list-project-env-keys:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent
                            className={cn(
                                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
                                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
                                "min-w-0 max-w-full overflow-hidden outline-none",
                            )}
                        >
                            <div className="flex min-w-0 max-w-full flex-col gap-3 py-1.5">
                                <EnvVarBadgeRow title="Non-encrypted" icon={LockOpen} envVars={plainEnvVars} />
                                <EnvVarBadgeRow title="Encrypted" icon={Lock} envVars={encryptedEnvVars} />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
            {payloadError != null && <ToolMessagePayloadError message={payloadError} />}
            {nestedMessages}
        </>
    );
}
