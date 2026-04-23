"use client";

import { usePageTitleBoxHeight, useStickyBreadcrumbBarHeight, useStickyBreadcrumbBarVisible } from "@/stores/breadcrumb";
import { useLayoutEffect } from "react";

const STICKY_BREADCRUMB_BAR_FALLBACK_HEIGHT_PX = 56;

const VAR_BREADCRUMB = "--baal-sticky-breadcrumb-bar-offset";
const VAR_PAGE_TITLE = "--baal-sticky-page-title-bar-offset";
const VAR_HEADERS_TOP = "--baal-sticky-headers-offset-top";

export function StickyHeaderInsetDocumentVars() {
    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const pageTitleBoxHeight = usePageTitleBoxHeight();

    useLayoutEffect(() => {
        const root = document.documentElement;
        const breadcrumbOffsetPx = stickyBarVisible
            ? stickyBarHeight > 0
                ? stickyBarHeight
                : STICKY_BREADCRUMB_BAR_FALLBACK_HEIGHT_PX
            : 0;
        const headersOffsetTopPx = breadcrumbOffsetPx + pageTitleBoxHeight;

        root.style.setProperty(VAR_BREADCRUMB, `${breadcrumbOffsetPx}px`);
        root.style.setProperty(VAR_PAGE_TITLE, `${pageTitleBoxHeight}px`);
        root.style.setProperty(VAR_HEADERS_TOP, `${headersOffsetTopPx}px`);

        return () => {
            root.style.removeProperty(VAR_BREADCRUMB);
            root.style.removeProperty(VAR_PAGE_TITLE);
            root.style.removeProperty(VAR_HEADERS_TOP);
        };
    }, [stickyBarVisible, stickyBarHeight, pageTitleBoxHeight]);

    return null;
}
