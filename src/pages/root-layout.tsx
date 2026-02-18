import { Outlet } from "react-router";
import { Loadable } from "./loadable";

export const RootLayout = () => {
  return (
    <Loadable>
      <Outlet />
    </Loadable>
  );
};