import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/query-provider";
import { apiClient } from "@/lib/api-client";
import { handleError, showApiError } from "@/lib/errors";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function createAppQueryClient() {
    return new QueryClient({
        queryCache: new QueryCache({
            onError: handleError,
        }),
        mutationCache: new MutationCache({
            onError: handleError,
        }),
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                retry: 0,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        apiClient.setOnError(showApiError);
    }, []);

    return (
        <QueryProvider createClient={createAppQueryClient}>
            <TooltipProvider delayDuration={0}>
                {children}
                <Toaster />
            </TooltipProvider>
        </QueryProvider>
    );
}
