export const QueryKeys = {
    AUTH_ME: ["auth", "me"] as const,
    AUTH_TOKENS: ["auth", "tokens"] as const,
    VERIFICATION_CODE: ["verification", "code"] as const,
    PAYMENT_PAYMENTS: ["payment", "payments"] as const,
    PAYMENT_PACKAGES: ["payment", "packages"] as const,
    PAYMENT_PAID_PACKAGES: ["payment", "paid-packages"] as const,
    projectDetail: (id: string) => ["project", "detail", id] as const,
    projectNonDraftUnits: (projectId: string) => ["project", "non-draft-units", projectId] as const,
    projectDraftUnits: (projectId: string, chatSessionId: string) => ["project", "draft-units", projectId, chatSessionId] as const,
    PROJECTS_LIST: ["project", "list"] as const,
    projectChatSessionList: (projectId: string) => ["chat", "sessions", "list", projectId] as const,
    projectChatSessionDetail: (projectId: string, chatSessionId: string) => ["chat", "sessions", "detail", projectId, chatSessionId] as const,
    projectChatSessionMessages: (projectId: string, chatSessionId: string) => ["chat", "sessions", "messages", projectId, chatSessionId] as const,
    chatSessionUnitsByIds: (projectId: string, chatSessionId: string, unitIds: string[]) =>
        ["chat", "sessions", "units-by-ids", projectId, chatSessionId, [...unitIds].sort().join(",")] as const,
    /** Set of "projectId:sessionId" for sessions currently generating a response (updated via WS). */
    chatSessionGeneratingSet: () => ["chat", "sessions", "generating"] as const,
    projectReleases: (projectId: string) => ["project", "releases", projectId] as const,
    projectReleaseUnits: (projectId: string, releaseVersion: string) => ["project", "release", "units", projectId, releaseVersion] as const,
    projectRuntimesWithConnectedChat: (projectId: string) => ["project", "runtimes", "with-connected-chat", projectId] as const,
};
