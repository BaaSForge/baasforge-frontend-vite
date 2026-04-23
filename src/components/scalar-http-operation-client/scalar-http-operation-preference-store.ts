import { STORAGE_KEYS } from "@/constants/storage-keys";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ScalarDefaultHttpClient = {
    targetKey: string;
    clientKey: string;
};

export const SCALAR_HTTP_OPERATION_WORKSPACE_SLUG = "baal-scalar-http-operation-embed-v1";

const DEFAULT_CLIENT: ScalarDefaultHttpClient = { targetKey: "shell", clientKey: "curl" };

type ScalarHttpOperationPreferenceState = {
    defaultHttpClient: ScalarDefaultHttpClient;
    setDefaultHttpClient: (next: ScalarDefaultHttpClient) => void;
};

export const useScalarHttpOperationPreferenceStore = create<ScalarHttpOperationPreferenceState>()(
    persist(
        (set, get) => ({
            defaultHttpClient: DEFAULT_CLIENT,
            setDefaultHttpClient: (next) => {
                const cur = get().defaultHttpClient;
                if (cur.targetKey === next.targetKey && cur.clientKey === next.clientKey) return;
                set({ defaultHttpClient: next });
            },
        }),
        {
            name: STORAGE_KEYS.SCALAR_HTTP_OPERATION_DEFAULT_CLIENT,
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({ defaultHttpClient: s.defaultHttpClient }),
        },
    ),
);
