import { ChevronRight, Folder, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const MAIN_NAV_ITEMS = [
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
    items: [
      { title: "Sessions", url: "/dashboard/tokens" },
    ],
  },
];

function isPathUnderItem(pathname: string, itemUrl: string): boolean {
  if (pathname === itemUrl) return true;
  if (itemUrl === "/") return false;
  return pathname.startsWith(itemUrl + "/");
}

export function NavMain() {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {MAIN_NAV_ITEMS.map((item) => {
          const isParentOpen = item.items?.some((sub) =>
            isPathUnderItem(pathname, sub.url)
          ) ?? false;

          return (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              defaultOpen={isParentOpen}
            >
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
                    {item.items?.map((subItem) => {
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
