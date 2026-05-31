import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  TicketCheck,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobileLabel?: string;
  showInMobileBar?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const SUPERADMIN_NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        mobileLabel: "Home",
        icon: LayoutDashboard,
        showInMobileBar: true,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/dashboard/tenants",
        label: "Schools",
        mobileLabel: "Schools",
        icon: Building2,
        showInMobileBar: true,
      },
      {
        href: "/dashboard/users",
        label: "Users",
        icon: Users,
        showInMobileBar: true,
      },
      {
        href: "/dashboard/plans",
        label: "Plans",
        icon: CreditCard,
      },
      {
        href: "/dashboard/subscriptions",
        label: "Subscriptions",
        icon: TicketCheck,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        href: "/dashboard/logs",
        label: "Audit Logs",
        mobileLabel: "Logs",
        icon: Activity,
      },
    ],
  },
];

export const SUPERADMIN_FOOTER_NAV: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export const SUPERADMIN_MOBILE_BAR_ITEMS: NavItem[] =
  SUPERADMIN_NAV_SECTIONS.flatMap((section) => section.items).filter(
    (item) => item.showInMobileBar,
  );

export const SUPERADMIN_MOBILE_OVERFLOW_ITEMS: NavItem[] = [
  ...SUPERADMIN_NAV_SECTIONS.flatMap((section) => section.items).filter(
    (item) => !item.showInMobileBar,
  ),
  ...SUPERADMIN_FOOTER_NAV,
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return (
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  );
}
