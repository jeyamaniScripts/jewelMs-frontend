export type NotificationType =
  | "employee_created"
  | "employee_deleted"
  | "employee_updated"
  | "role_created"
  | "role_updated"
  | "showroom_created"
  | "showroom_deleted"
  | "brand_created";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  actorName: string | null;
  createdAt: string;
}
