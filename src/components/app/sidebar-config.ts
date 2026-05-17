// src/components/app/sidebar-config.ts
import {
  Home,
  FileText,
  GraduationCap,
  UserCog,
  ShieldCheck,
  Award,
  Database,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/roles";

export type SidebarLeafItem = {
  label: string;
  href: string;
  roles: Role[];
};

export type SidebarGroupItem = {
  label: string;
  icon: LucideIcon;
  roles: Role[];
  children: SidebarLeafItem[];
};

export type SidebarLinkItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  roles: Role[];
};

export type SidebarItem = SidebarGroupItem | SidebarLinkItem;

const ALL: Role[] = ["super-admin", "admin", "coach", "student"];
const ADMIN_PLUS: Role[] = ["super-admin", "admin"];
const SUPER: Role[] = ["super-admin"];

// NOTE: children for Content/Student/Coach Management are placeholders.
// Replace these arrays as we design each section.
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Dashboard", icon: Home, href: "/app/dashboard", roles: ALL },
  {
    label: "Content Management",
    icon: FileText,
    roles: ADMIN_PLUS,
    children: [
      { label: "Homepage", href: "/app/content/homepage", roles: ADMIN_PLUS },
      { label: "About", href: "/app/content/about", roles: ADMIN_PLUS },
      { label: "Events", href: "/app/content/events", roles: ADMIN_PLUS },
    ],
  },
  {
    label: "Student Management",
    icon: GraduationCap,
    roles: ["super-admin", "admin", "coach"],
    children: [
      {
        label: "Students",
        href: "/app/student/list",
        roles: ["super-admin", "admin", "coach"],
      },
      {
        label: "Enrollment",
        href: "/app/student/enrollment",
        roles: ADMIN_PLUS,
      },
    ],
  },
  {
    label: "Coach Management",
    icon: UserCog,
    roles: ADMIN_PLUS,
    children: [
      { label: "Coaches", href: "/app/coach/list", roles: ADMIN_PLUS },
      { label: "Schedule", href: "/app/coach/schedule", roles: ADMIN_PLUS },
    ],
  },
  {
    label: "Admin Management",
    icon: ShieldCheck,
    href: "/app/admin",
    roles: SUPER,
  },
  {
    label: "Certificate Approval",
    icon: Award,
    href: "/app/certificate",
    roles: ADMIN_PLUS,
  },
  {
    label: "Master Management",
    icon: Database,
    roles: SUPER,
    children: [
      { label: "Program", href: "/app/master/program", roles: SUPER },
      {
        label: "Grading Belt",
        href: "/app/master/grading-belt",
        roles: SUPER,
      },
      { label: "Dojang", href: "/app/master/dojang", roles: SUPER },
      { label: "Product", href: "/app/master/product", roles: SUPER },
      { label: "Roles", href: "/app/master/roles", roles: SUPER },
    ],
  },
];

export function isGroupItem(item: SidebarItem): item is SidebarGroupItem {
  return "children" in item;
}

export function filterSidebarByRole(
  items: SidebarItem[],
  role: Role,
): SidebarItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (isGroupItem(item)) {
        return {
          ...item,
          children: item.children.filter((c) => c.roles.includes(role)),
        };
      }
      return item;
    })
    .filter((item) => !isGroupItem(item) || item.children.length > 0);
}

export function getCurrentSection(pathname: string): string {
  for (const item of SIDEBAR_ITEMS) {
    if (isGroupItem(item)) {
      const match = item.children.find((c) => pathname.startsWith(c.href));
      if (match) return item.label;
    } else if (pathname.startsWith(item.href)) {
      return item.label;
    }
  }
  return "Dashboard";
}
