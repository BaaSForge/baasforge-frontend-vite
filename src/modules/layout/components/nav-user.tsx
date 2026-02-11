import {
  ChevronsUpDown,
  CreditCard,
  Github,
  LogOut,
  Package,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/modules/auth";
import { PlatformType, type User } from "@/modules/auth/types";
import type { PaymentResponse } from "@/modules/payment";
import { usePackagesQuery, usePaidPackagesQuery } from "@/modules/payment";
import { TimeLeftLabel } from "@/components/time-left-label";
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
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
  if (daysLeft <= 7) return "bg-destructive";
  if (daysLeft <= 14) return "bg-chart-4";
  return "bg-primary";
}

function getNearestExpiringPayment(
  payments: PaymentResponse[]
): {
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
    .filter(
      (x): x is NonNullable<typeof x> =>
        !!x &&
        x.daysLeft >= 0 &&
        x.daysLeft <= EXPIRY_WARNING_DAYS
    )
    .sort((a, b) => {
      if (a.daysLeft === 0 && b.daysLeft === 0 && a.minutesLeft && b.minutesLeft) {
        return a.minutesLeft - b.minutesLeft;
      }
      return a.daysLeft - b.daysLeft;
    });

  return candidates[0] ?? null;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, isLoading, logout } = useAuth();
  const { data: packages = [] } = usePackagesQuery();
  const { data: paidData } = usePaidPackagesQuery();
  const nearestExpiring = getNearestExpiringPayment(
    (paidData?.payments ?? []).map((p) => p.payment)
  );
  const largestTier = paidData?.largest_tier ?? 0;
  const nextTierPackage = packages
    .filter((p) => (p.tier > largestTier && !p.is_trial))
    .sort((a, b) => a.tier - b.tier)[0];
  const hasMaxTier = !nextTierPackage;

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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {nearestExpiring && (
          <div className="px-3 py-2.5">
            <p className="text-muted-foreground mb-1 truncate text-xs">
              {nearestExpiring.payment.package_title ?? "Payment"} expiring soon
            </p>
            <Progress
              value={((EXPIRY_WARNING_DAYS - nearestExpiring.daysLeft) / EXPIRY_WARNING_DAYS) * 100}
              className="h-1.5 bg-muted"
              indicatorClassName={getExpiryIndicatorClass(nearestExpiring.daysLeft)}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              <TimeLeftLabel expiresAt={nearestExpiring.payment.expires_at} />
            </p>
          </div>
        )}
      </SidebarMenuItem>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-secondary">
                  <PlatformIcon platform={user.platform} className="size-2.5" />
                </span>
              </div>
              <div className="grid flex-1 items-center gap-0.5 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
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
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-secondary">
                    <PlatformIcon platform={user.platform} className="size-2.5" />
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
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
            </DropdownMenuGroup>
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
