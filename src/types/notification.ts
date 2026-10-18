export type NotificationType =
  | "employee_created"
  | "employee_deleted"
  | "employee_updated"
  | "role_created"
  | "role_updated"
  | "showroom_created"
  | "showroom_deleted"
  | "brand_created"
  | "category_created"
  | "category_updated"
  | "category_deleted"
  | "product_group_created"
  | "product_group_updated"
  | "product_group_deleted"
  | "product_name_created"
  | "product_name_updated"
  | "product_name_deleted"
  | "product_model_created"
  | "product_model_updated"
  | "product_model_deleted"
  | "supplier_created"
  | "supplier_updated"
  | "supplier_deleted"
  | "supplier_blacklisted"
  | "purchase_created"
  | "purchase_updated"
  | "purchase_deleted"
  | "purchase_confirmed"
  | "purchase_cancelled";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  actorName: string | null;
  createdAt: string;
}
