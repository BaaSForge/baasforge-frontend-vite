import { LoadingFallback } from "@/components/ui/loading-fallback";
import { Suspense, type ReactNode } from "react";

interface LoadableProps {
  children: ReactNode;
}

export const Loadable = ({ children }: LoadableProps) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};
