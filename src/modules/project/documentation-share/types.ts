export type DocumentationShareExpiryPresetId = "1d" | "3d" | "7d" | "1m" | "6m" | "forever";

export type DocumentationShareKeyRevealResponse = {
    documentation_share_key: string | null;
    expires_at: string | null;
};

export type DocumentationShareKeyResponse = {
    documentation_share_key: string;
    expires_at: string | null;
};

export type GenerateDocumentationShareKeyBody = {
    expires_at?: string;
};
