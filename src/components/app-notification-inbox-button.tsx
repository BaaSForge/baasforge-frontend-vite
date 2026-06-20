"use client";

import { CENTRIC_MODAL_SHELL_MAX_H, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRegisterAppChromeDismissWhenOpen } from "@/hooks/use-register-app-chrome-dismiss";
import {
    openAppNotification,
    readStoredNotificationGroupFilter,
    useAppNotificationBadge,
    useAppNotifications,
    writeStoredNotificationGroupFilter,
} from "@/stores/app-notifications";
import { cn } from "@/lib/utils";
import { events, triggerAppEvent } from "@/services/events";
import { Filter, Inbox, X } from "lucide-react";
import * as React from "react";

export const APP_NOTIFICATION_INBOX_BUTTON_ID = "app-notification-inbox-button";

function NotificationGroupFilterMenu({
    groupOptions,
    selectedGroups,
    onSelectedGroupsChange,
    menuSide,
    hasActiveFilter,
}: {
    groupOptions: string[];
    selectedGroups: string[];
    onSelectedGroupsChange: (next: string[]) => void;
    menuSide: "top" | "bottom";
    hasActiveFilter: boolean;
}) {
    const toggle = React.useCallback(
        (g: string, checked: boolean) => {
            if (checked) {
                onSelectedGroupsChange([...new Set([...selectedGroups, g])]);
            } else {
                onSelectedGroupsChange(selectedGroups.filter((x) => x !== g));
            }
        },
        [onSelectedGroupsChange, selectedGroups],
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant={hasActiveFilter ? "secondary" : "outline"}
                    size="icon-sm"
                    className={cn("shrink-0", hasActiveFilter && "font-semibold shadow-sm")}
                    aria-label="Filter notifications by group"
                    aria-pressed={hasActiveFilter}
                >
                    <Filter className="size-4" strokeWidth={hasActiveFilter ? 2.5 : 2} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side={menuSide}
                align="end"
                className="min-w-[12rem] max-w-[min(100vw-2rem,18rem)]"
            >
                <DropdownMenuGroup>
                    {groupOptions.map((g) => (
                        <DropdownMenuCheckboxItem
                            key={g}
                            checked={selectedGroups.includes(g)}
                            onCheckedChange={(c) => toggle(g, c === true)}
                        >
                            <span className="truncate" title={g}>
                                {g}
                            </span>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AppNotificationInboxButton() {
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);
    const notifications = useAppNotifications();
    const { label: badgeLabel, allRead: badgeAllRead } = useAppNotificationBadge();
    const [selectedGroups, setSelectedGroups] = React.useState<string[]>(() => readStoredNotificationGroupFilter());

    React.useEffect(() => {
        writeStoredNotificationGroupFilter(selectedGroups);
    }, [selectedGroups]);

    const prevOpenRef = React.useRef(open);

    React.useEffect(() => {
        if (open && !prevOpenRef.current) {
            triggerAppEvent(events.NOTIFICATION_OPENED_EVENT);
        }
        if (!open && prevOpenRef.current) {
            triggerAppEvent(events.NOTIFICATION_CLOSED_EVENT);
        }
        prevOpenRef.current = open;
    }, [open]);

    const closeInbox = React.useCallback(() => setOpen(false), []);

    useRegisterAppChromeDismissWhenOpen(open, closeInbox);

    const groupOptions = React.useMemo(() => {
        const set = new Set<string>();
        for (const n of notifications) {
            set.add(n.group);
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [notifications]);

    const appliedGroupFilter = React.useMemo(() => {
        const valid = new Set(groupOptions);
        return selectedGroups.filter((g) => valid.has(g));
    }, [groupOptions, selectedGroups]);

    const filtered = React.useMemo(() => {
        const list =
            appliedGroupFilter.length === 0
                ? notifications
                : notifications.filter((n) => appliedGroupFilter.includes(n.group));
        return [...list].sort((a, b) => b.pushedAt - a.pushedAt);
    }, [notifications, appliedGroupFilter]);

    const activateRow = React.useCallback((group: string, id: string) => {
        openAppNotification(group, id);
        queueMicrotask(() => {
            setOpen(false);
        });
    }, []);

    const renderHeaderBlock = (opts?: { extraClass?: string; title?: React.ReactNode; sheet?: boolean }) => {
        const sheet = opts?.sheet === true;
        const filterControls =
            groupOptions.length > 1 ? (
                <div className="flex shrink-0 items-center gap-1">
                    {selectedGroups.length > 0 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0"
                            aria-label="Clear group filter"
                            onClick={() => setSelectedGroups([])}
                        >
                            <X className="size-4" />
                        </Button>
                    ) : null}
                    <NotificationGroupFilterMenu
                        groupOptions={groupOptions}
                        selectedGroups={selectedGroups}
                        onSelectedGroupsChange={setSelectedGroups}
                        menuSide={isMobile ? "top" : "bottom"}
                        hasActiveFilter={appliedGroupFilter.length > 0}
                    />
                </div>
            ) : null;
        if (sheet) {
            return (
                <CentricModalHeader className={cn("relative", opts?.extraClass)}>
                    <CentricModalTitle
                        className={cn(
                            "w-full text-center text-base",
                            filterControls != null && "pe-12",
                        )}
                    >
                        {opts?.title ?? "Notifications"}
                    </CentricModalTitle>
                    {filterControls != null ? (
                        <div className="absolute end-0 top-1/2 flex -translate-y-1/2 items-center">{filterControls}</div>
                    ) : null}
                </CentricModalHeader>
            );
        }
        return (
            <div className={cn("flex shrink-0 flex-col py-2", opts?.extraClass)}>
                <div className="flex items-center justify-between gap-2">
                    {opts?.title ?? <div className="text-sm font-medium">Notifications</div>}
                    {filterControls}
                </div>
            </div>
        );
    };

    const bodyBlock =
        notifications.length === 0 ? (
            <Empty className="border-0 py-10">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Inbox className="size-6 opacity-70" />
                    </EmptyMedia>
                    <EmptyTitle>No notifications</EmptyTitle>
                    <EmptyDescription>Alerts from the app will show up here.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : filtered.length === 0 ? (
            <Empty className="border-0 py-10">
                <EmptyHeader>
                    <EmptyTitle>Nothing in this filter</EmptyTitle>
                    <EmptyDescription>Clear group filters to see every notification.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : (
            <ScrollArea className={cn(isMobile ? "min-h-0 flex-1" : "max-h-72")}>
                <ItemGroup className="p-1">
                    {filtered.map((n, i) => (
                        <React.Fragment key={`${n.group}\u0001${n.id}`}>
                            {i > 0 ? <ItemSeparator /> : null}
                            <Item
                                asChild
                                size="sm"
                                variant={n.read ? "default" : "muted"}
                                className={cn("w-full min-w-0", !n.read && "border-border/80 bg-muted/40")}
                            >
                                <button
                                    type="button"
                                    className="flex min-w-0 flex-1 flex-nowrap cursor-pointer items-center gap-2 py-2.5 pr-2 text-left outline-none"
                                    onClick={() => activateRow(n.group, n.id)}
                                >
                                    <ItemContent className="min-w-0 flex-1 gap-0.5">
                                        <ItemTitle className={cn(!n.read && "font-semibold")}>{n.title}</ItemTitle>
                                        {n.subtitle != null && n.subtitle !== "" ? (
                                            <ItemDescription>{n.subtitle}</ItemDescription>
                                        ) : null}
                                    </ItemContent>
                                    <ItemActions>
                                        <Badge variant="secondary" className="max-w-[6.5rem] shrink truncate font-normal" title={n.group}>
                                            {n.group}
                                        </Badge>
                                    </ItemActions>
                                </button>
                            </Item>
                        </React.Fragment>
                    ))}
                </ItemGroup>
            </ScrollArea>
        );

    const trigger = (
        <Button
            id={APP_NOTIFICATION_INBOX_BUTTON_ID}
            type="button"
            variant="outline"
            size="icon"
            className="relative shrink-0"
            aria-label="Notifications"
        >
            <Inbox className="h-[1.2rem] w-[1.2rem]" />
            {badgeLabel != null ? (
                <Badge
                    variant={badgeAllRead ? "secondary" : "default"}
                    className={cn(
                        "pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 min-w-5 justify-center px-1 text-[0.65rem] tabular-nums font-medium",
                        badgeAllRead &&
                            "border-transparent bg-muted/90 text-muted-foreground shadow-none dark:bg-muted/50",
                    )}
                >
                    {badgeLabel}
                </Badge>
            ) : null}
        </Button>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent
                    className={cn("flex flex-col gap-0 overflow-hidden p-0", "h-auto", CENTRIC_MODAL_SHELL_MAX_H)}
                >
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4">
                        {renderHeaderBlock({ sheet: true })}
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{bodyBlock}</div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent align="end" className="flex w-[min(100vw-2rem,22rem)] flex-col gap-0 p-0" sideOffset={8}>
                {renderHeaderBlock({ extraClass: "border-b border-border px-3" })}
                {bodyBlock}
            </PopoverContent>
        </Popover>
    );
}
