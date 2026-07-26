import { BookOpen, ChevronRight, Folder, Home, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";

const MAIN_NAV_ITEMS = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Docs",
        url: "/docs",
        icon: BookOpen,
        external: true,
    },
    {
        title: "Projects",
        url: "#",
        icon: Folder,
        items: [
            { title: "List Projects", url: "/dashboard/projects" },
            { title: "Create Project", url: "/dashboard/projects/new" },
        ],
    },
    {
        title: "Account",
        url: "#",
        icon: Settings2,
        items: [{ title: "Sessions", url: "/dashboard/tokens" }],
    },
];

function isPathUnderItem(pathname: string, itemUrl: string): boolean {
    if (pathname === itemUrl) return true;
    if (itemUrl === "/") return false;
    return pathname.startsWith(itemUrl + "/");
}

export function NavMain() {
    const { pathname } = useLocation();
    const { open, isMobile } = useSidebar();
    const isCollapsed = !open;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {MAIN_NAV_ITEMS.map((item) => {
                    if (!item.items?.length) {
                        const isActive = item.url === "/" ? pathname === "/" : isPathUnderItem(pathname, item.url);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                    {item.external ? (
                                        <a href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </a>
                                    ) : (
                                        <Link to={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    const isParentOpen = item.items.some((sub) => isPathUnderItem(pathname, sub.url));

                    if (isCollapsed) {
                        return (
                            <DropdownMenu key={item.title} modal={false}>
                                <SidebarMenuItem>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="start" sideOffset={8} className="min-w-48">
                                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                        {item.items.map((subItem) => {
                                            const isActive = pathname === subItem.url;
                                            return (
                                                <DropdownMenuItem key={subItem.title} asChild>
                                                    {subItem.url.startsWith("/") ? (
                                                        <Link to={subItem.url} className={isActive ? "bg-accent" : undefined}>
                                                            {subItem.title}
                                                        </Link>
                                                    ) : (
                                                        <a href={subItem.url}>{subItem.title}</a>
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </SidebarMenuItem>
                            </DropdownMenu>
                        );
                    }

                    return (
                        <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={isParentOpen}>
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => {
                                            const isActive = pathname === subItem.url;

                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={isActive}>
                                                        {subItem.url.startsWith("/") ? (
                                                            <Link to={subItem.url}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        ) : (
                                                            <a href={subItem.url}>
                                                                <span>{subItem.title}</span>
                                                            </a>
                                                        )}
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
