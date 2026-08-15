import type { IconType } from "react-icons";
import {
  MdDashboard,
  MdSettings,
  MdDiamond,
  MdStorefront,
  MdPeople,
  MdVpnKey,
  MdListAlt,
  MdPersonAdd,
} from "react-icons/md";
import type { Role } from "@/types/auth";

export interface MenuItem {
  key: string;
  label: string;
  icon: IconType;
  path: string;
  roles: Role[];
  /** Optional sub-items — when present, the item renders as an expandable group. */
  children?: MenuItem[];
}

const ALL_ROLES: Role[] = [
  "super_admin",
  "brand_admin",
  "brand_hr",
  "brand_manager",
  "showroom_admin",
  "showroom_manager",
  "cashier",
  "staff",
];

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: MdDashboard,
    path: "/dashboard",
    roles: ALL_ROLES,
  },
  {
    key: "site_settings",
    label: "Site Settings",
    icon: MdSettings,
    path: "/site-settings",
    roles: ["super_admin", "brand_admin"],
  },
  {
    key: "brands",
    label: "Jewelry Brands",
    icon: MdDiamond,
    path: "/brands",
    roles: ["super_admin"],
    children: [
      {
        key: "brands_list",
        label: "All Brands",
        icon: MdListAlt,
        path: "/brands",
        roles: ["super_admin"],
      },
      {
        key: "brands_new",
        label: "Add Brand",
        icon: MdPersonAdd,
        path: "/brands/new",
        roles: ["super_admin"],
      },
    ],
  },
  {
    key: "showrooms",
    label: "Showrooms",
    icon: MdStorefront,
    path: "/showrooms",
    roles: ["brand_admin"],
    children: [
      {
        key: "showrooms_list",
        label: "All Showrooms",
        icon: MdListAlt,
        path: "/showrooms",
        roles: ["brand_admin"],
      },
      {
        key: "showrooms_new",
        label: "Add Showroom",
        icon: MdPersonAdd,
        path: "/showrooms/new",
        roles: ["brand_admin"],
      },
    ],
  },
  {
    key: "employees",
    label: "Employees",
    icon: MdPeople,
    path: "/employees",
    roles: ["brand_admin", "showroom_admin"],
    children: [
      {
        key: "employees_list",
        label: "All Employees",
        icon: MdListAlt,
        path: "/employees",
        roles: ["brand_admin", "showroom_admin"],
      },
      {
        key: "employees_new",
        label: "Add Employee",
        icon: MdPersonAdd,
        path: "/employees/new",
        roles: ["brand_admin", "showroom_admin"],
      },
    ],
  },
  {
    key: "roles_permissions",
    label: "Roles & Permissions",
    icon: MdVpnKey,
    path: "/roles-permissions",
    roles: ["super_admin", "brand_admin", "showroom_admin"],
  },
];
