import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function PublicQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60_000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
