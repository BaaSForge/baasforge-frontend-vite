import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api-client";
import { handleError, showApiError } from "@/lib/errors";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        apiClient.setOnError(showApiError);
    }, []);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: handleError,
                }),
                mutationCache: new MutationCache({
                    onError: handleError,
                }),
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 0,
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: 0,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <Toaster />
                {children}
                {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />}
            </TooltipProvider>
        </QueryClientProvider>
    );
}
