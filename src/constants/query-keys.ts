export const QueryKeys = {
  AUTH_ME: ["auth", "me"] as const,
  AUTH_TOKENS: ["auth", "tokens"] as const,
  VERIFICATION_CODE: ["verification", "code"] as const,
  PAYMENT_PAYMENTS: ["payment", "payments"] as const,
  PAYMENT_PACKAGES: ["payment", "packages"] as const,
  PAYMENT_PAID_PACKAGES: ["payment", "paid-packages"] as const,
  projectDetail: (id: number) => ["project", "detail", id] as const,
  projectUnits: (projectId: number) => ["project", "units", projectId] as const,
  projectDraftUnits: (projectId: number, chatSessionId: number) =>
    ["project", "draft-units", projectId, chatSessionId] as const,
  PROJECTS_LIST: ["project", "list"] as const,
  projectChatSessionList: (projectId: number) => ["chat", "sessions", "list", projectId] as const,
};
