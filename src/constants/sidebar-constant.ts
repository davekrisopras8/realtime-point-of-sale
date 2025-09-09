import {
  Album,
  Armchair,
  LayoutDashboard,
  SquareMenu,
  Users,
} from "lucide-react";

export const SIDEBAR_MENU_LIST = {
  manager: [
    {
      title: "Dashboard",
      url: "/manager",
      icon: LayoutDashboard,
    },
    {
      title: "Order",
      url: "/order",
      icon: Album,
    },
    {
      title: "Menu",
      url: "/manager/menu",
      icon: SquareMenu,
    },
    {
      title: "Table",
      url: "/manager/table",
      icon: Armchair,
    },
    {
      title: "User",
      url: "/manager/user",
      icon: Users,
    },
  ],
  cashier: [],
  kitchen: [],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
