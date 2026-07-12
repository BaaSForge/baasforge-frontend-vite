import { Outlet } from "react-router";

import { AppStateLogger } from "@/modules/app-state";

import { Loadable } from "./loadable";

export const RootLayout = () => {
    return (
        <Loadable>
            <AppStateLogger />
            <Outlet />
        </Loadable>
    );
};
