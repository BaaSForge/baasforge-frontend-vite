export interface User {
    id: string;
    platform: PlatformType;
    id_in_platform: string;
    full_name: string | null;
    email_in_platform?: string | null;
}

export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
}

export enum PlatformType {
    GOOGLE = "google",
    GITHUB = "github",
}

export interface GetTokensFilter {
    revoked: boolean;
    type: TokenType;
}

export interface Token {
    id: string;
    token_type: TokenType;
    expires_at: string;
    created_at: string;
    revoked?: boolean;
    is_signup_token: boolean;
    refresh_token_id?: string | null;
}

export interface MeResponse extends User {
    last_subscription_cost_calculated_at?: string | null;
    token: Token;
}

export function userFromMe(me: MeResponse): User {
    const { id, platform, id_in_platform, full_name, email_in_platform } = me;
    return { id, platform, id_in_platform, full_name, email_in_platform };
}
