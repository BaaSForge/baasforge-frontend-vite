import { triggerAppEvent } from "./event-bus";
import { events } from "./events";

export function emitStageDeployModalOpened(): void {
    triggerAppEvent(events.STAGE_DEPLOY_MODAL_OPENED_EVENT);
}

export function emitStageDeployOnRuntimeDone(): void {
    triggerAppEvent(events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT);
}

export function emitStageReleaseBadgeClicked(): void {
    triggerAppEvent(events.STAGE_RELEASE_BADGE_CLICKED_EVENT);
}
