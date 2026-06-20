import { ChevronsUpDown, Clock, CreditCard, Gauge, Github, Keyboard, LogOut, Package, Sparkles } from "lucide-react";

import { GoogleIcon } from "@/components/icons/google-icon";
import { Link, useLocation } from "react-router";

import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";

import { TimeLeftLabel } from "@/components/time-left-label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useUpdateEffect } from "@/hooks/use-updated";
import { useAuth } from "@/modules/auth";
import { PlatformType, type User } from "@/modules/auth/types";
import type { PaymentResponse } from "@/modules/payment";
import { usePackagesQuery, usePaidPackagesQuery } from "@/modules/payment";
import { events, triggerAppEvent } from "@/services/events";
import { getTimeLeft } from "@/utils/time";

function PlatformIcon({ platform, className }: { platform: PlatformType; className?: string }) {
    if (platform === PlatformType.GITHUB) {
        return <Github className={className} />;
    }
    if (platform === PlatformType.GOOGLE) {
        return <GoogleIcon className={className} />;
    }
    return null;
}

function getInitials(user: User): string {
    const name = user.full_name?.trim();
    if (name) {
        const parts = name.split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    return "?";
}

const EXPIRY_WARNING_DAYS = 30;

function getExpiryIndicatorClass(daysLeft: number): string {
    if (daysLeft <= 7) return "bg-red-500";
    if (daysLeft <= 14) return "bg-orange-500";
    return "bg-emerald-500";
}

function getNearestExpiringPayment(payments: PaymentResponse[]): {
    payment: PaymentResponse;
    daysLeft: number;
    minutesLeft?: number;
    hoursLeft?: number;
} | null {
    const candidates = payments
        .filter((p) => p.is_success && p.expires_at)
        .map((p) => {
            const info = getTimeLeft(p.expires_at);

            if (info.type !== "active") return null;

            return {
                payment: p,
                daysLeft: info.days,
                hoursLeft: info.days === 0 ? info.hours : undefined,
                minutesLeft: info.days === 0 ? info.minutes : undefined,
            };
        })
        .filter((x): x is NonNullable<typeof x> => !!x && x.daysLeft >= 0 && x.daysLeft <= EXPIRY_WARNING_DAYS)
        .sort((a, b) => {
            if (a.daysLeft === 0 && b.daysLeft === 0 && a.minutesLeft && b.minutesLeft) {
                return a.minutesLeft - b.minutesLeft;
            }
            return a.daysLeft - b.daysLeft;
        });

    return candidates[0] ?? null;
}

function hasAnyActivePayment(payments: PaymentResponse[]): boolean {
    return payments.some((p) => p.is_success && p.expires_at && getTimeLeft(p.expires_at).type === "active");
}

type NavUserProps = {
    onOpenShortcuts: () => void;
};

export const APP_USER_MENU_BUTTON_ID = "app-user-menu-button";

export function NavUser({ onOpenShortcuts }: NavUserProps) {
    const { isMobile, open, setOpenMobile } = useSidebar();
    const { user, isLoading, logout } = useAuth();
    const { data: packages = [] } = usePackagesQuery();
    const { data: paidData } = usePaidPackagesQuery();
    const payments = (paidData?.payments ?? []).map((p) => p.payment);
    const hasActivePayment = hasAnyActivePayment(payments);
    const nearestExpiring = getNearestExpiringPayment(payments);
    const canPurchaseTrial = paidData?.can_purchase_trial ?? false;
    const largestTier = paidData?.largest_tier ?? 0;
    const nextTierPackage = packages.filter((p) => p.tier > largestTier && !p.is_trial).sort((a, b) => a.tier - b.tier)[0];
    const hasMaxTier = !nextTierPackage;
    const location = useLocation();

    useUpdateEffect(() => {
        setOpenMobile(false);
    }, [location.pathname, setOpenMobile]);

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" className="pointer-events-none">
                        <div className="bg-sidebar-accent h-8 w-8 animate-pulse rounded-lg" />
                        <div className="grid flex-1 gap-1 text-left">
                            <div className="bg-sidebar-accent h-4 w-24 animate-pulse rounded" />
                            <div className="bg-sidebar-accent h-3 w-32 animate-pulse rounded" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    if (!user) {
        return null;
    }

    const displayName = user.full_name ?? "User";
    const displayEmail = user.email_in_platform ?? "—";
    const promotionBoxExpanded = open || isMobile;

    return (
        <SidebarMenu>
            <SidebarMenuItem className="mb-5">
                {!hasActivePayment ? (
                    <HoverCard openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                            <Link
                                to="/dashboard/packages"
                                className={cn(
                                    "p-2 bg-blue-50 dark:bg-blue-950/60 transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/80 focus-visible:ring-blue-500 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-xl flex items-center",
                                    !promotionBoxExpanded && "p-0 bg-transparent hover:bg-transparent",
                                )}
                                tabIndex={0}
                            >
                                <span
                                    className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                        "bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-300",
                                        !promotionBoxExpanded && "w-8 h-8",
                                    )}
                                >
                                    <Sparkles className={cn("size-5", !promotionBoxExpanded && "size-4")} />
                                </span>
                                {promotionBoxExpanded && (
                                    <div className="min-w-0 flex-1 space-y-1.5 ml-3">
                                        <p className="text-blue-700 dark:text-blue-200 text-sm font-semibold leading-snug">Unlock all features</p>
                                        <p className="text-blue-900/70 dark:text-blue-300/80 text-xs leading-relaxed">
                                            Buy a package to get the full experience.
                                        </p>
                                        {canPurchaseTrial && <p className="text-blue-500 dark:text-blue-400 text-xs font-medium">Start with a free trial →</p>}
                                    </div>
                                )}
                            </Link>
                        </HoverCardTrigger>
                        {!promotionBoxExpanded && (
                            <HoverCardContent side="right" align="center" className="shadow-none rounded-xl">
                                <div className="flex flex-row items-start gap-3">
                                    <span className="bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                        <Sparkles className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <p className="text-blue-700 dark:text-blue-200 text-sm font-semibold leading-snug">Unlock all features</p>
                                        <p className="text-blue-900/70 dark:text-blue-300/80 text-xs leading-relaxed">
                                            Buy a package to get the full experience.
                                        </p>
                                        {canPurchaseTrial && <p className="text-blue-500 dark:text-blue-400 text-xs font-medium">Start with a free trial →</p>}
                                    </div>
                                </div>
                            </HoverCardContent>
                        )}
                    </HoverCard>
                ) : nearestExpiring ? (
                    (() => {
                        const expiryProgressValue = ((EXPIRY_WARNING_DAYS - nearestExpiring.daysLeft) / EXPIRY_WARNING_DAYS) * 100;
                        const expiryIndicatorClass = getExpiryIndicatorClass(nearestExpiring.daysLeft);
                        const expiryTitle = nearestExpiring.payment.package_title ?? "Payment";
                        const { expires_at: expiresAt } = nearestExpiring.payment;

                        const expiryContent = (
                            <>
                                <p className="text-muted-foreground truncate text-xs">{expiryTitle} expiring soon</p>
                                <Progress value={expiryProgressValue} className="h-1.5 bg-muted" indicatorClassName={expiryIndicatorClass} />
                                <p className="text-muted-foreground text-xs">
                                    <TimeLeftLabel expiresAt={expiresAt} />
                                </p>
                            </>
                        );

                        return promotionBoxExpanded ? (
                            <div className="space-y-1.5 px-3 py-2.5">{expiryContent}</div>
                        ) : (
                            <HoverCard openDelay={0} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex w-full flex-col items-center justify-center gap-1.5 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-md"
                                        aria-label={`${expiryTitle} expiring soon`}
                                    >
                                        <div
                                            className="flex h-9 w-1.5 flex-col justify-end overflow-hidden rounded-full bg-muted"
                                            role="progressbar"
                                            aria-valuenow={Math.round(expiryProgressValue)}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className={cn("w-full min-h-[2px] shrink-0 rounded-full transition-all", expiryIndicatorClass)}
                                                style={{ height: `${expiryProgressValue}%` }}
                                            />
                                        </div>
                                        <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                                    </button>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" sideOffset={8} className="max-w-[200px] p-3">
                                    <div className="space-y-1.5">{expiryContent}</div>
                                </HoverCardContent>
                            </HoverCard>
                        );
                    })()
                ) : null}
            </SidebarMenuItem>
            <SidebarMenuItem>
                <DropdownMenu
                    onOpenChange={(open) => {
                        triggerAppEvent(open ? events.USER_MENU_OPENED_EVENT : events.USER_MENU_CLOSED_EVENT);
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            id={APP_USER_MENU_BUTTON_ID}
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="relative shrink-0">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={undefined} alt={displayName} />
                                    <AvatarFallback className="rounded-lg">{getInitials(user)}</AvatarFallback>
                                </Avatar>
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-secondary">
                                    <PlatformIcon platform={user.platform} className="size-2.5" />
                                </span>
                            </div>
                            <div className="grid flex-1 items-center gap-0.5 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium">{displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <div className="relative shrink-0">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={undefined} alt={displayName} />
                                        <AvatarFallback className="rounded-lg">{getInitials(user)}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-secondary">
                                        <PlatformIcon platform={user.platform} className="size-2.5" />
                                    </span>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{displayName}</span>
                                    <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {hasMaxTier ? (
                                <DropdownMenuItem disabled className="cursor-default">
                                    <Sparkles />
                                    You have purchased our greatest tier!
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard/packages">
                                        <Sparkles />
                                        Upgrade to {nextTierPackage.title}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/packages">
                                    <Package />
                                    Packages
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/payments">
                                    <CreditCard />
                                    Payments
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/usage">
                                    <Gauge />
                                    Overall usage
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={onOpenShortcuts}>
                            <Keyboard />
                            Shortkeys
                            <span className="text-muted-foreground ml-auto font-mono text-xs">{SHORTCUT_LABELS.OPEN_SHORTCUTS_MODAL}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => void logout()}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
