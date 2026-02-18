import { createContext } from "react";

type InternalSecondarySidebarContextValue = {
  handleOpenChangeSkipStorage: (open: boolean) => void;
  rereadSidebarOpen: () => void;
};

export const InternalSecondarySidebarContext = createContext<InternalSecondarySidebarContextValue | undefined>(undefined);
