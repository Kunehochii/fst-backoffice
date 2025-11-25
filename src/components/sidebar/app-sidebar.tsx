"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeDollarSign,
  IdCardLanyard,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Receipt,
  Send,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Cashiers",
      url: "/dashboard/cashiers",
      icon: BadgeDollarSign,
    },
    {
      title: "Employees",
      url: "/dashboard/employees",
      icon: IdCardLanyard,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Deliveries",
      url: "/dashboard/delivery",
      icon: Truck,
    },
    {
      title: "Bills",
      url: "/dashboard/bills",
      icon: Receipt,
    },
    {
      title: "Sales Check",
      url: "/dashboard/sales-check",
      icon: ShoppingCart,
    },
    {
      title: "Profit",
      url: "/dashboard/profit",
      icon: TrendingUp,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/vercel.svg"
                    alt="Falsisters Logo"
                    width={16}
                    height={16}
                    className="invert"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Falsisters</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
