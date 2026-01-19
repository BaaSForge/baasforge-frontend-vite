import { Spinner } from "@/components/ui/spinner";
import { Suspense, type ReactNode } from "react";

interface LoadableProps {
  children: ReactNode;
}

export const Loadable = ({ children }: LoadableProps) => {
  return (
    <Suspense
      fallback={
        <Spinner />
      }
    >
      {children}
    </Suspense>
  );
};
