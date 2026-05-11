export const QueryKeys = {
    AUTH_ME: ["auth", "me"] as const,
    AUTH_TOKENS: ["auth", "tokens"] as const,
    VERIFICATION_CODE: ["verification", "code"] as const,
    PAYMENT_PAYMENTS: ["payment", "payments"] as const,
    PAYMENT_PACKAGES: ["payment", "packages"] as const,
    PAYMENT_PAID_PACKAGES: ["payment", "paid-packages"] as const,
    projectDetail: (id: string) => ["project", "detail", id] as const,
    /**
     * One chat session: map of stable unit id (`stableUnitIdForRevisionCache`) → latest revision.
     * Not used for screens without a chat session (e.g. release units list).
     */
    chatSessionUnitLatestRevisionsByUnitId: (projectId: string, chatSessionId: string) =>
        ["chat", "sessions", "unit-latest-revisions-by-unit-id", projectId, chatSessionId] as const,
    projectNonDraftUnits: (projectId: string) => ["project", "non-draft-units", projectId] as const,
    projectDraftUnitsByProject: (projectId: string) => ["project", "draft-units", projectId] as const,
    projectDraftUnits: (projectId: string, chatSessionId: string) => ["project", "draft-units", projectId, chatSessionId] as const,
    projectDraftUnitsAsOfReleaseControllerMessageByProject: (projectId: string) =>
        ["project", "draft-units", "as-of-release-controller-message", projectId] as const,
    projectDraftUnitsAsOfReleaseControllerMessage: (projectId: string, chatSessionId: string, messageId: string) =>
        ["project", "draft-units", "as-of-release-controller-message", projectId, chatSessionId, messageId] as const,
    projectLastNotDisabledReleaseControllerMessageByProject: (projectId: string) =>
        ["project", "release-controller-messages", "last-not-disabled", projectId] as const,
    projectLastNotDisabledReleaseControllerMessage: (projectId: string, chatSessionId: string) =>
        ["project", "release-controller-messages", "last-not-disabled", projectId, chatSessionId] as const,
    PROJECTS_LIST: ["project", "list"] as const,
    projectChatSessionList: (projectId: string) => ["chat", "sessions", "list", projectId] as const,
    projectChatSessionDetail: (projectId: string, chatSessionId: string) => ["chat", "sessions", "detail", projectId, chatSessionId] as const,
    projectAllChatSessionDetailByProject: (projectId: string) => ["chat", "sessions", "detail", projectId] as const,
    projectChatSessionMessages: (projectId: string, chatSessionId: string) => ["chat", "sessions", "messages", projectId, chatSessionId] as const,
    /** POST unit-latest-revisions-by-ids: `unit_paths` (no trailing `.<revision>`), sorted for key stability. */
    chatSessionUnitLatestRevisionsByIds: (projectId: string, chatSessionId: string, unitPaths: string[]) =>
        ["chat", "sessions", "unit-latest-revisions-by-ids", projectId, chatSessionId, [...unitPaths].sort().join(",")] as const,
    /** Set of "projectId:sessionId" for sessions currently generating a response (updated via WS). */
    chatSessionGeneratingSet: () => ["chat", "sessions", "generating"] as const,
    /** Releases list for `GET .../releases?environment={environment}`. */
    projectReleases: (projectId: string, environment: string) => ["project", "releases", projectId, environment] as const,
    projectReleaseByRevision: (projectId: string, environment: string, revision: number) =>
        ["project", "releases", "by-revision", projectId, environment, revision] as const,
    /** `releaseId` — release row id, not numeric revision (revision can repeat across sessions). */
    projectReleaseUnits: (projectId: string, releaseId: string) => ["project", "release", "units", projectId, releaseId] as const,
    projectReleaseUnitsByProject: (projectId: string) => ["project", "release", "units", projectId] as const,
    projectReleaseContexts: (projectId: string, releaseId: string) => ["project", "release", "contexts", projectId, releaseId] as const,
    projectModulesByContexts: (projectId: string, releaseId: string, contextSlugsKey: string) =>
        ["project", "modules-by-contexts", projectId, releaseId, contextSlugsKey] as const,
    projectReleaseUnitsAll: (projectId: string, releaseId: string, requestKey: string) =>
        ["project", "release", "units", "all", projectId, releaseId, requestKey] as const,
    projectReleaseUnitsAllByProject: (projectId: string) => ["project", "release", "units", "all", projectId] as const,
    projectRuntimes: (projectId: string) => ["project", "runtimes", projectId] as const,
};
