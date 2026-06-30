import { triggerAppEvent } from "./event-bus";
import { events } from "./events";

export function emitStageDeployModalOpened(): void {
    triggerAppEvent(events.STAGE_DEPLOY_MODAL_OPENED_EVENT);
}

export function emitStageDeployOnRuntimeDone(runtimeId?: string): void {
    triggerAppEvent(events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT, runtimeId);
}

export function emitStageReleaseBadgeClicked(): void {
    triggerAppEvent(events.STAGE_RELEASE_BADGE_CLICKED_EVENT);
}

export function emitUnitLiveInteractionClicked(): void {
    triggerAppEvent(events.UNIT_LIVE_INTERACTION_CLICKED_EVENT);
}
