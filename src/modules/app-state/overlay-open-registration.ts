import { appStateStore } from "./store";

export type OverlayKind = "modal" | "alert";

let modalOpenCount = 0;
let alertOpenCount = 0;

function setModalOpenFlag(): void {
    appStateStore.setState({ isAnyModalOpen: modalOpenCount > 0 });
}

function setAlertOpenFlag(): void {
    appStateStore.setState({ isAnyAlertOpen: alertOpenCount > 0 });
}

export function incrementOverlayOpen(kind: OverlayKind): void {
    if (kind === "modal") {
        modalOpenCount += 1;
        setModalOpenFlag();
        return;
    }

    alertOpenCount += 1;
    setAlertOpenFlag();
}

export function decrementOverlayOpen(kind: OverlayKind): void {
    if (kind === "modal") {
        modalOpenCount = Math.max(0, modalOpenCount - 1);
        setModalOpenFlag();
        return;
    }

    alertOpenCount = Math.max(0, alertOpenCount - 1);
    setAlertOpenFlag();
}
