"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Settings,
  Star,
  Percent,
  File,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Server,
  Mail,
  History,
  Coins,
  Receipt,
  ReceiptText,
  Tag,
  ScrollText,
  Building,
  Tags,
  Calendar,
  Clock,
  LayoutGrid,
  Globe,
  TimerOff,
  Gift,
  Wallet,
  BookOpen,
  CalendarCheck,
  CreditCard,
  PercentSquare,
  TicketPercent,
  Webhook,
  List,
  Link2,
  FileSpreadsheet,
  XCircle,
  LayoutList,
  FileText,
  DollarSign,
  CheckCheck,
  ShoppingCart
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import Image from "next/image";




const orgUserNavItems = [
  {
    title: "All Reservations",
    href: "/dashboard/reservations",
    icon: Calendar,
  },
  {
    title: "All Waiting List",
    href: "/dashboard/reservations/waiting-list",
    icon: TimerOff,
  },
  {
    title: "Report",
    icon: File,
    submenu: [
      {
        title: "Reservation Report",
        href: "/dashboard/report/reservation-report",
        icon: Calendar,
      },
      {
        title: "Reservation Time",
        href: "/dashboard/report/reservation-time-report",
        icon: Calendar,
      },
      {
        title: "Waiting List Report",
        href: "/dashboard/report/waiting-report",
        icon: List,
      },
      {
        title: "Cancelled Reservation Report",
        href: "/dashboard/report/cancelled-reservation-report",
        icon: XCircle,
      },
      {
        title: "Detailed Report",
        href: "/dashboard/report/detailed-report",
        icon: FileSpreadsheet,
      },

    ],
  },
];

const adminNavItems = [
 

  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Bar Code Generator",
    href: "/dashboard/bar-code-generator",
    icon: TicketPercent,
  },
 
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
 
  {
    title: "Settings",
    icon: Settings,
    submenu: [
      // {
      //   title: "Brands",
      //   href: "/dashboard/settings/brands",
      //   icon: Tags,
      // },
      // {
      //   title: "Branches",
      //   href: "/dashboard/settings/branches",
      //   icon: Building,
      // },
      // {
      //   title: "Countries",
      //   href: "/dashboard/settings/countries",
      //   icon: Globe,
      // },
    
      {
        title: "Users",
        href: "/dashboard/settings/users",
        icon: Users,
      },
     
    ],
  },
];

const userNavItems = [
  {
    title: "All Reservations",
    href: "/dashboard/reservations",
    icon: Calendar,
  },
  {
    title: "All Waiting List",
    href: "/dashboard/reservations/waiting-list",
    icon: TimerOff,
  },
];

function NestedSubmenu({ item, pathname, level = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasNestedSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = item.submenu
    ? item.submenu.some(sub => sub.href === pathname || (sub.submenu && sub.submenu.some(nested => nested.href === pathname)))
    : pathname === item.href;

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Define text sizes based on level
  const textSizes = [
    'text-sm',    // Level 0 (first level)
    'text-sm',    // Level 1 (second level)
    'text-xs',    // Level 2 (third level)
    'text-xs',    // Level 3 (fourth level)
  ];
  const textSize = textSizes[Math.min(level, textSizes.length - 1)];
  const iconSizes = [
    'h-4 w-4',    // Level 0 (first level)
    'h-3.5 w-3.5', // Level 1 (second level)
    'h-3 w-3',    // Level 2 (third level)
    'h-3 w-3',    // Level 3 (fourth level)
  ];
  const iconSize = iconSizes[Math.min(level, iconSizes.length - 1)];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        <Link
          href={item.href || '#'}
          className={`flex-1 flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent ${isActive ? 'bg-accent' : ''}`}
        >
          {item.icon && <item.icon className={`${iconSize} shrink-0`} />}
          <span className={`truncate ${textSize}`}>{item.title}</span>
        </Link>
        {hasNestedSubmenu && (
          <button
            onClick={toggleOpen}
            className="p-1 rounded-md hover:bg-accent"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      {hasNestedSubmenu && isOpen && (
        <div className={`pl-${(level + 1) * 4} mt-1`}>
          {item.submenu.map((subItem) => (
            <NestedSubmenu
              key={subItem.title}
              item={subItem}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItem(props) {
  const { item } = props;
  const pathname = usePathname();
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = hasSubmenu
    ? item.submenu.some(sub => sub.href === pathname || (sub.submenu && sub.submenu.some(nested => nested.href === pathname)))
    : pathname === item.href;

  if (hasSubmenu) {
    return (
      <SidebarMenuItem key={item.title}>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className="w-full"
              isActive={isActive}
              asChild
            >
              <div>
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.submenu.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <NestedSubmenu
                    item={subItem}
                    pathname={pathname}
                  />
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar(props) {
  const { user } = props;
  const pathname = usePathname();
  const { state } = useSidebar();
  // const displayNavItems =
  //   user?.user_type === "BRANCH_USER"
  //     ? branchNavItems
  //     : user?.user_type === "BRANCH_MANAGER"
  //       ? branchManagerNavItems
  //       : user?.user_type === "ADMIN"
  //         ? adminNavItems
  //         : user?.user_type === "USER"
  //           ? userNavItems
  //           : user?.user_type === "ORGANIZATION_USER"
  //             ? orgUserNavItems
  //             : user?.user_type === "SUPERADMIN"
  //               ? navItems
  //               : [];
  const displayNavItems =
    user?.user_type === "ADMIN"
          ? adminNavItems
          : user?.user_type === "USER"
            ? userNavItems
           : [];

  return (
    <Sidebar className="border-r z-3" collapsible="icon" data-state={state}>
      <SidebarHeader
        className={cn(
          "px-3 pt-4 pb-1 relative bg-gray-100",
          "transition-all duration-200",
          // Hide when collapsed
          state === "collapsed" && "opacity-0 h-0 py-0 overflow-hidden"
        )}
      >
        <div className="w-full flex items-center justify-center">
          <img src="/re_logo.png" alt="Logo" style={{ height: "50px" }} />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto bg-gray-100">
        <SidebarGroup className="px-3 py-2">
          <SidebarMenu>
            {displayNavItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="px-3 py-4 border-t bg-white/60">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="h-4 w-4 shrink-0" />
                <span>Account Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter> */}
    </Sidebar>
  );
}
