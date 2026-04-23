import { useEffect, type RefObject } from "react";

const SHOW_SCHEMA_CHECKBOX_SELECTOR =
    ".response-card input.scalar-card-checkbox-input[type='checkbox']";

function checkShowSchemaInputs(root: HTMLElement) {
    for (const input of root.querySelectorAll<HTMLInputElement>(SHOW_SCHEMA_CHECKBOX_SELECTOR)) {
        if (!input.checked) input.click();
    }
}

export function useScalarExampleResponsesShowSchemaDefault(
    embedRootRef: RefObject<HTMLDivElement | null>,
    remountKey: string,
) {
    useEffect(() => {
        const root = embedRootRef.current;
        if (!root) return;

        const sync = () => checkShowSchemaInputs(root);
        sync();
        const observer = new MutationObserver(() => sync());
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [remountKey, embedRootRef]);
}
