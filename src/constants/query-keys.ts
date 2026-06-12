import type { ChatMessageResponse, ChatSessionResponse } from "@/modules/project-chat/types";
import type { PlatformEnvironmentType, ProjectResponse, ReleaseResponse } from "@/modules/project/types";
import type { ListUsageEntriesParams, UsageCostParams } from "@/modules/usage/types";

type ProjectId = ProjectResponse["id"];
type ChatSessionId = ChatSessionResponse["id"];
type ChatMessageId = ChatMessageResponse["id"];
type ReleaseId = ReleaseResponse["id"];
type ReleaseRevision = ReleaseResponse["revision"];
type ContextSlugsKey = string;
type RequestKey = string;
type UnitPath = string;

export const QueryKeys = {
    AUTH_ME: ["auth", "me"] as const,
    AUTH_TOKENS: ["auth", "tokens"] as const,
    VERIFICATION_CODE: ["verification", "code"] as const,
    PAYMENT_PAYMENTS: ["payment", "payments"] as const,
    PAYMENT_PACKAGES: ["payment", "packages"] as const,
    PAYMENT_PAID_PACKAGES: ["payment", "paid-packages"] as const,
    projectDetail: (projectId: ProjectId) => ["project", "detail", projectId] as const,
    /**
     * One chat session: map of stable unit id (`stableUnitIdForRevisionCache`) → latest revision.
     * Not used for screens without a chat session (e.g. release units list).
     */
    chatSessionUnitLatestRevisionsByUnitId: (projectId: ProjectId, chatSessionId: ChatSessionId) =>
        ["chat", "sessions", "unit-latest-revisions-by-unit-id", projectId, chatSessionId] as const,
    projectNonDraftUnits: (projectId: ProjectId) => ["project", "non-draft-units", projectId] as const,
    projectDraftUnitsByProject: (projectId: ProjectId) => ["project", "draft-units", projectId] as const,
    projectDraftUnits: (projectId: ProjectId, chatSessionId: ChatSessionId) =>
        ["project", "draft-units", projectId, chatSessionId] as const,
    projectDraftUnitsAsOfReleaseControllerMessageByProject: (projectId: ProjectId) =>
        ["project", "draft-units", "as-of-release-controller-message", projectId] as const,
    projectDraftUnitsAsOfReleaseControllerMessage: (projectId: ProjectId, chatSessionId: ChatSessionId, messageId: ChatMessageId) =>
        ["project", "draft-units", "as-of-release-controller-message", projectId, chatSessionId, messageId] as const,
    projectLastNotDisabledReleaseControllerMessageByProject: (projectId: ProjectId) =>
        ["project", "release-controller-messages", "last-not-disabled", projectId] as const,
    projectLastNotDisabledReleaseControllerMessage: (projectId: ProjectId, chatSessionId: ChatSessionId) =>
        ["project", "release-controller-messages", "last-not-disabled", projectId, chatSessionId] as const,
    PROJECTS_LIST: ["project", "list"] as const,
    projectChatSessionList: (projectId: ProjectId) => ["chat", "sessions", "list", projectId] as const,
    projectChatSessionDetail: (projectId: ProjectId, chatSessionId: ChatSessionId) =>
        ["chat", "sessions", "detail", projectId, chatSessionId] as const,
    projectAllChatSessionDetailByProject: (projectId: ProjectId) => ["chat", "sessions", "detail", projectId] as const,
    projectChatSessionMessages: (projectId: ProjectId, chatSessionId: ChatSessionId) =>
        ["chat", "sessions", "messages", projectId, chatSessionId] as const,
    /** POST unit-latest-revisions-by-ids: `unit_paths` (no trailing `.<revision>`), sorted for key stability. */
    chatSessionUnitLatestRevisionsByIds: (projectId: ProjectId, chatSessionId: ChatSessionId, unitPaths: readonly UnitPath[]) =>
        ["chat", "sessions", "unit-latest-revisions-by-ids", projectId, chatSessionId, [...unitPaths].sort().join(",")] as const,
    /** Set of "projectId:sessionId" for sessions currently generating a response (updated via WS). */
    chatSessionGeneratingSet: () => ["chat", "sessions", "generating"] as const,
    /** Releases list for `GET .../releases?environment={environment}`. */
    projectReleases: (projectId: ProjectId, environment: PlatformEnvironmentType) => ["project", "releases", projectId, environment] as const,
    projectLiveReleaseByRevision: (projectId: ProjectId, environment: PlatformEnvironmentType, revision: ReleaseRevision) =>
        ["project", "releases", "live-release-by-revision", projectId, environment, revision] as const,
    /** Prefix key: invalidates every cached live-release-by-revision lookup for one project + environment. */
    projectLiveReleaseByRevisionByEnv: (projectId: ProjectId, environment: PlatformEnvironmentType) =>
        ["project", "releases", "live-release-by-revision", projectId, environment] as const,
    /** Prefix key: invalidates every cached live-release-by-revision lookup for one project across environments. */
    projectLiveReleaseByRevisionByProject: (projectId: ProjectId) =>
        ["project", "releases", "live-release-by-revision", projectId] as const,
    /** `releaseId` — release row id, not numeric revision (revision can repeat across sessions). */
    projectReleaseUnits: (projectId: ProjectId, releaseId: ReleaseId) => ["project", "release", "units", projectId, releaseId] as const,
    projectReleaseUnitsByProject: (projectId: ProjectId) => ["project", "release", "units", projectId] as const,
    projectReleaseContexts: (projectId: ProjectId, releaseId: ReleaseId) => ["project", "release", "contexts", projectId, releaseId] as const,
    projectModulesByContexts: (projectId: ProjectId, releaseId: ReleaseId, contextSlugsKey: ContextSlugsKey) =>
        ["project", "modules-by-contexts", projectId, releaseId, contextSlugsKey] as const,
    projectReleaseUnitsAll: (projectId: ProjectId, releaseId: ReleaseId, requestKey: RequestKey) =>
        ["project", "release", "units", "all", projectId, releaseId, requestKey] as const,
    projectReleaseUnitsAllByProject: (projectId: ProjectId) => ["project", "release", "units", "all", projectId] as const,
    projectRuntimes: (projectId: ProjectId) => ["project", "runtimes", projectId] as const,
    projectRuntimeEnvVars: (projectId: ProjectId, isEncrypted: boolean) =>
        ["project", "runtime-env-vars", projectId, isEncrypted] as const,
    projectRuntimeEnvVarsByProject: (projectId: ProjectId) => ["project", "runtime-env-vars", projectId] as const,
    /** POST `.../traces/by-ids`: sorted trace id list for stable cache keys. */
    projectTracesByIds: (projectId: ProjectId, traceIdsKey: string) =>
        ["project", "traces", "by-ids", projectId, traceIdsKey] as const,
    packagesTypeDefinitionFiles: (packagesKey: string) =>
        ["platform", "packages-type-definition-files", packagesKey] as const,
    packageTypeDefinitionFileContents: (filesKey: string) =>
        ["platform", "package-type-definition-file-contents", filesKey] as const,
    usageEntries: (params: ListUsageEntriesParams) =>
        [
            "usage",
            "entries",
            params.project_id ?? "all",
            params.from ?? "",
            params.to ?? "",
            params.page ?? 1,
            params.page_size ?? 20,
        ] as const,
    usageCost: (params: UsageCostParams) =>
        ["usage", "cost", params.project_id ?? "all", params.from ?? "", params.to ?? ""] as const,
};
