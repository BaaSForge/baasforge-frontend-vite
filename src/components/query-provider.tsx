import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

type QueryClientFactory = () => QueryClient;

function createPublicQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60_000,
                refetchOnWindowFocus: false,
            },
        },
    });
}

export function QueryProvider({
    children,
    createClient = createPublicQueryClient,
}: {
    children: React.ReactNode;
    createClient?: QueryClientFactory;
}) {
    const [queryClient] = useState(createClient);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
