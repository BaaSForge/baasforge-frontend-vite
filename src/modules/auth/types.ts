export interface User {
  id: number;
  platform: string;
  id_in_platform: string;
  full_name: string | null;
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export interface GetTokensFilter {
  revoked: boolean;
  type: TokenType;
}

export interface Token {
  id: number;
  token_type: TokenType;
  expires_at: string;
  created_at: string;
  revoked?: boolean;
  is_signup_token: boolean;
}