import * as React from "react";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-1 flex-col gap-6">
      {children}
    </section>
  );
}

function ContainerMainContent({ children }: { children: React.ReactNode }) {
  return <div className="px-4 space-y-6">{children}</div>;
}

Container.MainContent = ContainerMainContent;
