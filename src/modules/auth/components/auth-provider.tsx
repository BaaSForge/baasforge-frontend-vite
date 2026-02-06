import type { ReactNode } from "react";
import { useCurrentUserQuery } from "../queries";

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useCurrentUserQuery();
  return <>{children}</>;
}
