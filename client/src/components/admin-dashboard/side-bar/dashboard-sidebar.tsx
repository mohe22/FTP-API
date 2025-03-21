import { BarChart3, Users, UserCircle, Settings, Activity } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
export function DashboardSidebar() {
  const { pathname } = useLocation();

  console.log(pathname);

  const routes = [
    {
      label: "Overview",
      icon: BarChart3,
      href: "/admin-dashboard",
      active: pathname === "/admin-dashboard",
    },
    {
      label: "Users",
      icon: UserCircle,
      href: "/admin-dashboard/users",
      active: pathname.startsWith("/admin-dashboard/users"),
    },
    {
      label: "Groups",
      icon: Users,
      href: "/admin-dashboard/groups",
      active: pathname.startsWith("/admin-dashboard/groups"),
    },
    {
      label: "Activity",
      icon: Activity,
      href: "/admin-dashboard/activity",
      active: pathname.startsWith("/admin-dashboard/activity"),
    },

  ];

  return (

      <Sidebar className="mt-[64px] border-t">
        <SidebarContent className="pt-2 mx-2">
          <SidebarMenu>
            {routes.map((project) => (
              <SidebarMenuItem key={project.href}>
                <SidebarMenuButton
                  className={cn(
                    project.href == pathname &&
                      "bg-primary text-primary-foreground rounded-sm"
                  )}
                  asChild
                >
                  <a href={project.href}>
                    <project.icon />
                    <span>{project.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
  );
}
