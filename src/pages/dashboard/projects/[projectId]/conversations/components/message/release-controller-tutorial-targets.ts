export const APP_RELEASE_CONTROLLER_STAGE_BUTTON_DATA_ATTR = "data-app-release-controller-stage-button";
export const APP_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_DATA_ATTR = "data-app-release-controller-stage-release-link";
export const APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID = "app-last-release-controller-stage-button";
export const APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID = "app-last-release-controller-stage-release-link";

export const APP_RELEASE_CONTROLLER_PROD_BUTTON_DATA_ATTR = "data-app-release-controller-prod-button";
export const APP_RELEASE_CONTROLLER_PROD_RELEASE_LINK_DATA_ATTR = "data-app-release-controller-prod-release-link";
export const APP_LAST_RELEASE_CONTROLLER_PROD_BUTTON_ID = "app-last-release-controller-prod-button";
export const APP_LAST_RELEASE_CONTROLLER_PROD_RELEASE_LINK_ID = "app-last-release-controller-prod-release-link";

export const APP_STAGE_DEPLOY_MODAL_ID = "app-stage-deploy-modal";

function queryLastElement(selector: string): HTMLElement | null {
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    return nodes.length > 0 ? nodes[nodes.length - 1]! : null;
}

function assignSpotlightIdToLastElement(selector: string, spotlightId: string): boolean {
    document.querySelectorAll(`#${spotlightId}`).forEach((el) => el.removeAttribute("id"));
    const last = queryLastElement(selector);
    if (last == null) return false;
    last.id = spotlightId;
    return true;
}

export function assignLastReleaseControllerStageButtonSpotlightId(): boolean {
    return assignSpotlightIdToLastElement(
        `[${APP_RELEASE_CONTROLLER_STAGE_BUTTON_DATA_ATTR}]`,
        APP_LAST_RELEASE_CONTROLLER_STAGE_BUTTON_ID,
    );
}

export function assignLastReleaseControllerStageReleaseLinkSpotlightId(): boolean {
    return assignSpotlightIdToLastElement(
        `[${APP_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_DATA_ATTR}]`,
        APP_LAST_RELEASE_CONTROLLER_STAGE_RELEASE_LINK_ID,
    );
}

export function assignLastReleaseControllerProdButtonSpotlightId(): boolean {
    return assignSpotlightIdToLastElement(
        `[${APP_RELEASE_CONTROLLER_PROD_BUTTON_DATA_ATTR}]`,
        APP_LAST_RELEASE_CONTROLLER_PROD_BUTTON_ID,
    );
}

export function assignLastReleaseControllerProdReleaseLinkSpotlightId(): boolean {
    return assignSpotlightIdToLastElement(
        `[${APP_RELEASE_CONTROLLER_PROD_RELEASE_LINK_DATA_ATTR}]`,
        APP_LAST_RELEASE_CONTROLLER_PROD_RELEASE_LINK_ID,
    );
}

export function isStageDeployModalOpen(): boolean {
    const el = document.getElementById(APP_STAGE_DEPLOY_MODAL_ID);
    return el?.getAttribute("data-state") === "open";
}
