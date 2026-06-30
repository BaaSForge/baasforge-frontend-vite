import type { ChatMessageResponse } from "@/modules/project-chat/types";
import type { ToolCreateUnitPayload } from "@/modules/project-chat/payloads";

export const events = {
    TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED: "tutorial-primary-action-button-clicked",
    TUTORIAL_PREV_BUTTON_CLICKED: "tutorial-prev-button-clicked",
    TUTORIAL_STOP_BUTTON_CLICKED: "tutorial-stop-button-clicked",
    NOTIFICATION_OPENED_EVENT: "notification-opened",
    NOTIFICATION_CLOSED_EVENT: "notification-closed",
    MAIN_SIDEBAR_OPENED_EVENT: "main-sidebar-opened",
    MAIN_SIDEBAR_CLOSED_EVENT: "main-sidebar-closed",
    USER_MENU_OPENED_EVENT: "user-menu-opened",
    USER_MENU_CLOSED_EVENT: "user-menu-closed",
    PROJECT_CREATE_BUTTON_CLICKED_EVENT: "project-create-button-clicked",
    PROJECT_SWITCH_MENU_OPENED_EVENT: "project-switch-menu-opened",
    PROJECT_SELECTED_EVENT: "project-selected",
    PROJECT_CREATED_EVENT: "project-created",
    DEVELOP_BUTTON_CLICKED_EVENT: "develop-button-clicked",
    CHAT_COMPOSER_INPUT_FOCUSED_EVENT: "chat-composer-input-focused",
    CHAT_COMPOSER_FILL_PROMPT_EVENT: "chat-composer-fill-prompt",
    UNIT_ID_BADGE_COPIED_EVENT: "unit-id-badge-copied",
    UNIT_CHANGES_MODAL_OPENED_EVENT: "unit-changes-modal-opened",
    UNIT_CHANGES_MODAL_CLOSED_EVENT: "unit-changes-modal-closed",
    RELEASE_UNITS_FILTER_FILL_UNIT_ID_EVENT: "release-units-filter-fill-unit-id",
    RELEASE_UNITS_FILTER_APPLIED_EVENT: "release-units-filter-applied",
    RELEASE_UNITS_LOADED_EVENT: "release-units-loaded",
    MESSAGE_RECEIVED_EVENT: "message-received",
    CREATE_UNIT_RECEIVED_EVENT: "create-unit-received",
    RELEASE_CONTROLLER_RECEIVED_EVENT: "release-controller-received",
    STAGE_DEPLOY_MODAL_OPENED_EVENT: "stage-deploy-modal-opened",
    STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT: "stage-deploy-on-runtime-done",
    STAGE_RELEASE_BADGE_CLICKED_EVENT: "stage-release-badge-clicked",
    UNIT_LIVE_INTERACTION_CLICKED_EVENT: "unit-live-interaction-clicked",
} as const;

export type AppEventName = (typeof events)[keyof typeof events];

export type AppEventPayloadMap = {
    [events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED]: undefined;
    [events.TUTORIAL_PREV_BUTTON_CLICKED]: undefined;
    [events.TUTORIAL_STOP_BUTTON_CLICKED]: undefined;
    [events.NOTIFICATION_OPENED_EVENT]: undefined;
    [events.NOTIFICATION_CLOSED_EVENT]: undefined;
    [events.MAIN_SIDEBAR_OPENED_EVENT]: undefined;
    [events.MAIN_SIDEBAR_CLOSED_EVENT]: undefined;
    [events.USER_MENU_OPENED_EVENT]: undefined;
    [events.USER_MENU_CLOSED_EVENT]: undefined;
    [events.PROJECT_CREATE_BUTTON_CLICKED_EVENT]: undefined;
    [events.PROJECT_SWITCH_MENU_OPENED_EVENT]: undefined;
    [events.PROJECT_SELECTED_EVENT]: undefined;
    [events.PROJECT_CREATED_EVENT]: { projectId: string };
    [events.DEVELOP_BUTTON_CLICKED_EVENT]: undefined;
    [events.CHAT_COMPOSER_INPUT_FOCUSED_EVENT]: undefined;
    [events.CHAT_COMPOSER_FILL_PROMPT_EVENT]: { text: string };
    [events.UNIT_ID_BADGE_COPIED_EVENT]: { unitId: string };
    [events.UNIT_CHANGES_MODAL_OPENED_EVENT]: undefined;
    [events.UNIT_CHANGES_MODAL_CLOSED_EVENT]: undefined;
    [events.RELEASE_UNITS_FILTER_FILL_UNIT_ID_EVENT]: { unitId: string };
    [events.RELEASE_UNITS_FILTER_APPLIED_EVENT]: { unitsPaths: string[] };
    [events.RELEASE_UNITS_LOADED_EVENT]: undefined;
    [events.MESSAGE_RECEIVED_EVENT]: undefined;
    [events.CREATE_UNIT_RECEIVED_EVENT]: ChatMessageResponse<ToolCreateUnitPayload>;
    [events.RELEASE_CONTROLLER_RECEIVED_EVENT]: undefined;
    [events.STAGE_DEPLOY_MODAL_OPENED_EVENT]: undefined;
    [events.STAGE_DEPLOY_ON_RUNTIME_DONE_EVENT]: string | undefined;
    [events.STAGE_RELEASE_BADGE_CLICKED_EVENT]: undefined;
    [events.UNIT_LIVE_INTERACTION_CLICKED_EVENT]: undefined;
};
