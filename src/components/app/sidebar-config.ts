// src/components/app/sidebar-config.ts
import {
  Home,
  FileText,
  GraduationCap,
  UserCog,
  ShieldCheck,
  Database,
  User,        
  Calendar,    
  Trophy,      
  MessageCircle,
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

const ADMIN_PLUS: Role[] = ["super-admin", "admin"];
const SUPER: Role[] = ["super-admin"];
const STUDENT_ONLY: Role[] = ["student"];

// NOTE: children for Content/Student/Coach Management are placeholders.
// Replace these arrays as we design each section.
export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/app/dashboard",
    roles: ["super-admin", "admin", "coach"],
  },
  {
    label: "My Profile",
    icon: User,
    href: "/app/dashboard",
    roles: STUDENT_ONLY,
  },
  {
    label: "Class Schedule",
    icon: Calendar,
    roles: STUDENT_ONLY,
    children: [
      { label: "Schedule", href: "/app/me/schedule", roles: STUDENT_ONLY },
      { label: "E-Book", href: "/app/me/ebook", roles: STUDENT_ONLY },
    ],
  },
  {
    label: "My Score",
    icon: Trophy,
    roles: STUDENT_ONLY,
    children: [
      { label: "Score", href: "/app/me/score", roles: STUDENT_ONLY },
      { label: "Certificate", href: "/app/me/certificate", roles: STUDENT_ONLY },
    ],
  },
  {
    label: "Contact Us",
    icon: MessageCircle,
    href: "/app/me/contact",
    roles: STUDENT_ONLY,
  },
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
        label: "Data",
        href: "/app/student/data",
        roles: ["super-admin", "admin", "coach"],
      },
      {
        label: "Attendance",
        href: "/app/student/attendance",
        roles: ["super-admin", "admin", "coach"],
      },
      {
        label: "Score",
        href: "/app/student/score",
        roles: ["super-admin", "admin", "coach"],
      },
    ],
  },
  {
    label: "Coach Management",
    icon: UserCog,
    roles: ADMIN_PLUS,
    children: [
      { label: "Data", href: "/app/coach/data", roles: ADMIN_PLUS },
      { label: "Schedule", href: "/app/coach/schedule", roles: ADMIN_PLUS },
      { label: "Attendance", href: "/app/coach/attendance", roles: ADMIN_PLUS },
      {
        label: "Recommendation",
        href: "/app/coach/recommendation",
        roles: ADMIN_PLUS,
      },
    ],
  },
  {
    label: "Admin Management",
    icon: ShieldCheck,
    href: "/app/admin",
    roles: SUPER,
  },
  {
    label: "Master Management",
    icon: Database,
    roles: SUPER,
    children: [
      { label: "Program", href: "/app/master/program", roles: SUPER },
      { label: "Sub Program", href: "/app/master/sub-program", roles: SUPER },
      { label: "E-Book", href: "/app/master/ebook", roles: SUPER },
      { label: "Grading Belt", href: "/app/master/grading-belt", roles: SUPER },
      { label: "Dojang", href: "/app/master/dojang", roles: SUPER },
      { label: "Product", href: "/app/master/product", roles: SUPER },
      { label: "Roles", href: "/app/master/roles", roles: SUPER },
      {
        label: "Schedule Period",
        href: "/app/master/schedule-period",
        roles: SUPER,
      },
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
