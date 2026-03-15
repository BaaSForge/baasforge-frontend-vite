import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { LOGGED_IN_FROM_PARAM } from "../constants";

export function AuthLayout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const handledRef = useRef(false);

    useEffect(() => {
        const from = searchParams.get(LOGGED_IN_FROM_PARAM);
        if (from == null || from === "" || handledRef.current) return;

        handledRef.current = true;
        toast.success(`Welcome back! You've signed in from ${from}.`, { position: "top-center" });

        searchParams.delete(LOGGED_IN_FROM_PARAM);
        const nextSearch = searchParams.toString();
        const nextUrl = nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname;
        navigate(nextUrl, { replace: true });
    }, [location.pathname, navigate, searchParams]);

    return <Outlet />;
}
