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
  MdBusiness,
  MdCategory,
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
    path: "/site-settings/login-activity",
    roles: ["super_admin", "brand_admin"],
    children: [
      {
        key: "site_settings_company_details",
        label: "Company Details",
        icon: MdBusiness,
        path: "/site-settings/company-details",
        // Brand Admin only — a Super Admin oversees many brands, not one,
        // so they manage brands via the "Jewelry Brands" menu instead.
        roles: ["brand_admin"],
      },
      {
        key: "site_settings_login_activity",
        label: "Login Activity",
        icon: MdListAlt,
        path: "/site-settings/login-activity",
        roles: ["super_admin", "brand_admin"],
      },
    ],
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
    // Category is scoped to Brand Admin, same as Showrooms/Roles — it's
    // brand-level master data. Product Group, Product Name, and Product
    // Model will join as siblings here as each is built.
    key: "inventory",
    label: "Inventory",
    icon: MdCategory,
    path: "/inventory/categories",
    roles: ["brand_admin"],
    children: [
      {
        key: "inventory_categories",
        label: "Categories",
        icon: MdListAlt,
        path: "/inventory/categories",
        roles: ["brand_admin"],
      },
      {
        key: "inventory_categories_new",
        label: "Add Category",
        icon: MdPersonAdd,
        path: "/inventory/categories/new",
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
