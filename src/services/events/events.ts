export const events = {
    TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED: "tutorial-primary-action-button-clicked",
    NOTIFICATION_OPENED_EVENT: "notification-opened",
    NOTIFICATION_CLOSED_EVENT: "notification-closed",
} as const;

export type AppEventName = (typeof events)[keyof typeof events];
