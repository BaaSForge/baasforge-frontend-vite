"use client";

import { CopyButton } from "@/components/copy-button";
import { emitScalarTraceIdCopied } from "@/services/events";
import { createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SCALAR_RESPONSE_HEADERS_SECTION_SELECTOR } from "./use-tutorial-scalar-response-headers-target";

const COPY_HOST_ATTR = "data-baasforge-trace-id-copy";

function findScalarResponseHeadersSection(): HTMLElement | null {
    const sections = document.querySelectorAll(SCALAR_RESPONSE_HEADERS_SECTION_SELECTOR);
    for (const section of sections) {
        if (!(section instanceof HTMLElement)) continue;
        const button = section.querySelector("button[type='button']");
        if (button?.textContent?.includes("Response Headers")) return section;
    }
    return null;
}

function ensureHeadersExpanded(section: HTMLElement): void {
    if (section.querySelector(".group\\/row") != null) return;
    const toggle = section.querySelector("button[type='button']");
    if (!(toggle instanceof HTMLButtonElement)) return;
    if (toggle.getAttribute("aria-expanded") === "true") return;
    toggle.click();
}

function readHeaderName(nameCell: HTMLElement): string {
    const clone = nameCell.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return nameCell.textContent?.trim() ?? "";
    clone.querySelector(`[${COPY_HOST_ATTR}]`)?.remove();
    return clone.textContent?.trim() ?? "";
}

function findTraceIdRow(section: HTMLElement): { nameCell: HTMLElement; value: string } | null {
    const rows = section.querySelectorAll(".group\\/row");
    for (const row of rows) {
        if (!(row instanceof HTMLElement)) continue;
        const cells = row.querySelectorAll("span.flex-1");
        if (cells.length < 2) continue;
        const nameCell = cells[0];
        const valueCell = cells[1];
        if (!(nameCell instanceof HTMLElement) || !(valueCell instanceof HTMLElement)) continue;
        const name = readHeaderName(nameCell);
        const value = valueCell.textContent?.trim() ?? "";
        if (name.toLowerCase() === "x-trace-id" && value) {
            return { nameCell, value };
        }
    }
    return null;
}

export function useScalarTraceIdCopyButton(tutorialScalarTraceIdCopyTargetId?: string): void {
    useEffect(() => {
        let host: HTMLElement | undefined;
        let root: Root | undefined;
        let renderedTraceId: string | undefined;

        const unmount = () => {
            root?.unmount();
            root = undefined;
            host?.remove();
            host = undefined;
            renderedTraceId = undefined;
        };

        const render = (nameCell: HTMLElement, traceId: string): void => {
            if (host?.isConnected && root != null && renderedTraceId === traceId) {
                if (tutorialScalarTraceIdCopyTargetId) {
                    const button = host.querySelector("button");
                    if (button instanceof HTMLButtonElement && button.id !== tutorialScalarTraceIdCopyTargetId) {
                        button.id = tutorialScalarTraceIdCopyTargetId;
                    }
                }
                return;
            }

            if (host == null || !host.isConnected || root == null) {
                unmount();
                host = document.createElement("span");
                host.setAttribute(COPY_HOST_ATTR, "true");
                host.className = "inline-flex items-center align-middle ml-2";
                nameCell.appendChild(host);
                root = createRoot(host);
            }

            renderedTraceId = traceId;
            root.render(
                createElement(CopyButton, {
                    id: tutorialScalarTraceIdCopyTargetId,
                    textToCopy: traceId,
                    copyId: `scalar-trace-id:${traceId}`,
                    "aria-label": "Copy X-Trace-Id",
                    onCopied: (copiedTraceId) => emitScalarTraceIdCopied({ traceId: copiedTraceId }),
                }),
            );
        };

        const attach = (): void => {
            const section = findScalarResponseHeadersSection();
            if (section == null) return;

            ensureHeadersExpanded(section);

            const row = findTraceIdRow(section);
            if (row == null) return;

            render(row.nameCell, row.value);
        };

        attach();

        const observer = new MutationObserver(attach);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        return () => {
            observer.disconnect();
            unmount();
        };
    }, [tutorialScalarTraceIdCopyTargetId]);
}
