"use client";

import { EllipsisVertical, LogOut } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  SIDEBAR_MENU_LIST,
  SidebarMenuKey,
} from "@/constants/sidebar-constant";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth-actions";
import { useAuthStore } from "@/stores/auth-store";
import LogoDakries from "../../assets/images/logo-dakries-cafe.png";

const getInitials = (name?: string): string => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return undefined;
  }
  return url;
};

export default function AppSidebar() {
  const { isMobile, open } = useSidebar();
  const pathname = usePathname();
  const profile = useAuthStore((state) => state.profile);
  const reset = useAuthStore((state) => state.reset);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      reset();
      await signOut();
    } catch (error) {}
  }, [reset]);

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const initials = getInitials(profile.name);
  const menuItems = SIDEBAR_MENU_LIST[profile.role as SidebarMenuKey] || [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="font-semibold">
                <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg border border-cyan-500/20 relative overflow-hidden">
                    <Image
                      src={LogoDakries}
                      alt="Logo"
                      width={40}
                      height={40}
                      priority
                    />
                  </div>
                </div>
                {mounted ? (
                  <span
                    className={cn(
                      "transition-all duration-200",
                      !open && "opacity-0 w-0 overflow-hidden",
                      open && "opacity-100"
                    )}
                  >
                    Dakries Café & Resto
                  </span>
                ) : (
                  <span className="opacity-100">Dakries Café & Resto</span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a
                        href={item.url}
                        className={cn(
                          "px-4 py-3 h-auto transition-colors",
                          isActive
                            ? "bg-cyan-500 text-white hover:!bg-cyan-600 hover:!text-white"
                            : "hover:bg-cyan-500 hover:text-cyan-500"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {Icon && <Icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={avatarUrl}
                      alt={`${profile.name}'s avatar`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-base">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm leading-tight">
                    <h4 className="truncate font-medium">{profile.name}</h4>
                    <p className="truncate text-xs capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={avatarUrl}
                        alt={`${profile.name}'s avatar`}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback className="rounded-full">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm leading-tight">
                      <h4 className="truncate font-medium">{profile.name}</h4>
                      <p className="text-muted-foreground truncate text-xs capitalize">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
