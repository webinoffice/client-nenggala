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
  Award,
  MessageCircle,
  Users,
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
const COACH_ONLY: Role[] = ["coach"];

// NOTE: children for Content/Student/Coach Management are placeholders.
// Replace these arrays as we design each section.
export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/app/dashboard",
    roles: SUPER,
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
      { label: "Class Schedule", href: "/app/me/schedule", roles: STUDENT_ONLY },
      {
        label: "E-Book Taekwondo Guides",
        href: "/app/me/ebook",
        roles: STUDENT_ONLY,
      },
    ],
  },
  {
    label: "My Score",
    icon: Trophy,
    roles: STUDENT_ONLY,
    children: [
      { label: "My Taekwondo Score", href: "/app/me/score", roles: STUDENT_ONLY },
      {
        label: "Your Certification",
        href: "/app/me/certificate",
        roles: STUDENT_ONLY,
      },
    ],
  },
  {
    label: "Contact Us",
    icon: MessageCircle,
    href: "/app/me/contact",
    roles: STUDENT_ONLY,
  },
  {
    label: "My Profile",
    icon: User,
    href: "/app/dashboard",
    roles: COACH_ONLY,
  },
  {
    label: "Class Schedule",
    icon: Calendar,
    roles: COACH_ONLY,
    children: [
      {
        label: "Coaching Schedule",
        href: "/app/coach-me/schedule",
        roles: COACH_ONLY,
      },
      { label: "Attendance Report", href: "/app/coach-me/report", roles: COACH_ONLY },
      {
        label: "E-Book Taekwondo Guides",
        href: "/app/coach-me/ebook",
        roles: COACH_ONLY,
      },
    ],
  },
  {
    label: "Your Certification",
    icon: Trophy,
    href: "/app/coach-me/certificate",
    roles: COACH_ONLY,
  },
  {
    label: "Content Management",
    icon: FileText,
    roles: SUPER,
    children: [
      { label: "Homepage", href: "/app/content/homepage", roles: SUPER },
      { label: "About", href: "/app/content/about", roles: SUPER },
      { label: "Events", href: "/app/content/events", roles: SUPER },
    ],
  },
  {
    label: "Student Management",
    icon: GraduationCap,
    roles: ADMIN_PLUS,
    children: [
      {
        label: "Student's Data",
        href: "/app/student/data",
        roles: ADMIN_PLUS,
      },
      {
        label: "Attendance Report",
        href: "/app/student/attendance",
        roles: ADMIN_PLUS,
      },
      {
        label: "Score Management",
        href: "/app/student/score",
        roles: ADMIN_PLUS,
      },
      {
        label: "Reset Student Password",
        href: "/app/student/change-password",
        roles: ADMIN_PLUS,
      },
    ],
  },
  {
    label: "Coach Management",
    icon: UserCog,
    roles: ADMIN_PLUS,
    children: [
      { label: "Coach's Data", href: "/app/coach/data", roles: ADMIN_PLUS },
      {
        label: "Schedule Management",
        href: "/app/coach/schedule",
        roles: ADMIN_PLUS,
      },
      {
        label: "Coach Attendance Report",
        href: "/app/coach/attendance",
        roles: ADMIN_PLUS,
      },
      {
        label: "Student Recommendation",
        href: "/app/coach/recommendation",
        roles: ADMIN_PLUS,
      },
    ],
  },
  {
    label: "Add Certificate",
    icon: Award,
    href: "/app/certificate",
    roles: ADMIN_PLUS,
  },
  {
    label: "Latihan Gabungan",
    icon: Users,
    href: "/app/joint-training",
    roles: SUPER,
  },
  {
    label: "Admin Data",
    icon: ShieldCheck,
    href: "/app/admin",
    roles: SUPER,
  },
  {
    label: "Master Management",
    icon: Database,
    roles: ADMIN_PLUS,
    children: [
      { label: "Master Program", href: "/app/master/program", roles: SUPER },
      { label: "Master Sub Program", href: "/app/master/sub-program", roles: SUPER },
      { label: "Master E-Book", href: "/app/master/ebook", roles: SUPER },
      { label: "Master Belt", href: "/app/master/grading-belt", roles: SUPER },
      { label: "Master Dojang", href: "/app/master/dojang", roles: SUPER },
      { label: "Master Product", href: "/app/master/product", roles: SUPER },
      { label: "Master Roles", href: "/app/master/roles", roles: SUPER },
      {
        label: "Schedule Period Management",
        href: "/app/master/schedule-period",
        roles: ADMIN_PLUS,
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
