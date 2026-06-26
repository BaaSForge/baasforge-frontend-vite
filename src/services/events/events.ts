export const events = {
    TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED: "tutorial-primary-action-button-clicked",
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
    MESSAGE_RECEIVED_EVENT: "message-received",
    CREATE_UNIT_RECEIVED_EVENT: "create-unit-received",
    RELEASE_CONTROLLER_RECEIVED_EVENT: "release-controller-received",
} as const;

export type AppEventName = (typeof events)[keyof typeof events];
