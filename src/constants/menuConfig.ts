import type { IconType } from "react-icons";
import {
  MdDashboard,
  MdSettings,
  MdDiamond,
  MdStorefront,
  MdPeople,
  MdVpnKey,
  MdListAlt,
  MdBusiness,
  MdCategory,
  MdLocalShipping,
  MdContacts,
  MdShoppingCart,
  MdTune,
  MdNotificationsActive,
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
  /** Restrict this menu to the currently selected main branch. */
  branchAccess?: "main";
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

// Sidebar only surfaces list pages — every "Add X" screen is reached via
// the "Add" button on its own list page, not as a separate sidebar entry.
// Groups that would otherwise have exactly one child now render as a
// single flat link instead of an expandable group with one item in it.
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
    label: "Admin Settings",
    icon: MdSettings,
    path: "/admin-settings",
    roles: ["super_admin", "brand_admin", "showroom_admin"],
    children: [
      {
        key: "admin_settings_site_settings",
        label: "Site Settings",
        icon: MdTune,
        path: "/admin-settings",
        roles: ["super_admin", "brand_admin"],
      },
      {
        key: "admin_settings_master_data",
        label: "Master Data",
        icon: MdListAlt,
        path: "/admin-settings/masters",
        roles: ["brand_admin"],
      },
      {
        key: "admin_settings_notifications",
        label: "Notifications",
        icon: MdNotificationsActive,
        path: "/admin-settings/notifications",
        roles: ["brand_admin"],
      },
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
      {
        key: "roles_permissions",
        label: "Roles & Permissions",
        icon: MdVpnKey,
        path: "/roles-permissions",
        roles: ["super_admin", "brand_admin", "showroom_admin"],
      },
    ],
  },
  {
    // Flattened — "All Brands" was the only list page here, and "Add
    // Brand" now lives behind the Add button on that list page.
    key: "brands",
    label: "Jewelry Brands",
    icon: MdDiamond,
    path: "/brands",
    roles: ["super_admin"],
  },
  {
    // Flattened — same reasoning as Brands above.
    key: "showrooms",
    label: "Showrooms",
    icon: MdStorefront,
    path: "/showrooms",
    roles: ["brand_admin"],
  },
  {
    // Full product hierarchy lives here: Category -> Product Group ->
    // Product Name -> Product Model, all scoped to Brand Admin as
    // brand-level master data. Each is a list page only — creating a new
    // one happens via that page's own "Add" button.
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
        key: "inventory_product_groups",
        label: "Product Groups",
        icon: MdListAlt,
        path: "/inventory/product-groups",
        roles: ["brand_admin"],
      },
      {
        key: "inventory_product_names",
        label: "Product Names",
        icon: MdListAlt,
        path: "/inventory/product-names",
        roles: ["brand_admin"],
      },
      {
        key: "inventory_product_models",
        label: "Product Models",
        icon: MdListAlt,
        path: "/inventory/product-models",
        roles: ["brand_admin"],
      },
    ],
  },

  {
    key: "parties",
    label: "Parties",
    icon: MdContacts,
    path: "/suppliers",
    roles: ["brand_admin"],
    children: [
      {
        key: "parties_suppliers",
        label: "Suppliers",
        icon: MdLocalShipping,
        path: "/Accounts/suppliers",
        roles: ["brand_admin"],
      },
      // Add once the Customer form ships:
      // {
      //   key: "parties_customers",
      //   label: "Customers",
      //   icon: MdPeopleAlt,
      //   path: "/customers",
      //   roles: ["brand_admin"],
      // },
    ],
  },
  {
    key: "purchases",
    label: "Purchases",
    icon: MdShoppingCart,
    path: "/purchases",
    roles: ["brand_admin"],
    branchAccess: "main",
    children: [
      {
        key: "purchases_weight_based",
        label: "Weight-Based Purchases",
        icon: MdListAlt,
        path: "/purchases/weight-purchases",
        roles: ["brand_admin"],
      },
    ],
  },

  {
    // Flattened — same reasoning as Brands/Showrooms above.
    key: "employees",
    label: "Employees",
    icon: MdPeople,
    path: "/employees",
    roles: ["brand_admin", "showroom_admin"],
  },
];

function flattenPermissionMenus(
  items: MenuItem[],
  parents: string[] = [],
): Array<Pick<MenuItem, "key" | "label">> {
  return items.flatMap(({ key, label, children }) => {
    const path = [...parents, label];
    const item = { key, label: path.join(" / ") };
    return [item, ...(children ? flattenPermissionMenus(children, path) : [])];
  });
}

// Every parent and child receives an independent permission key.
export const PERMISSION_MENU_CONFIG = flattenPermissionMenus(MENU_CONFIG);
