import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AppNotification } from "@/types/notification";
import type { PaginationMeta } from "@/types/dataTable";
import { apiRequest } from "@/lib/apiClient";

interface NotificationState {
  notifications: AppNotification[];
  pagination: PaginationMeta | null;
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: NotificationState = {
  notifications: [],
  pagination: null,
  unreadCount: 0,
  status: "idle",
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (query: { page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return apiRequest<{ notifications: AppNotification[]; pagination: PaginationMeta }>(
      `/notifications${qs ? `?${qs}` : ""}`
    );
  }
);

export const fetchUnreadCount = createAsyncThunk("notification/fetchUnreadCount", async () => {
  const { count } = await apiRequest<{ count: number }>("/notifications/unread-count");
  return count;
});

export const markNotificationRead = createAsyncThunk("notification/markRead", async (id: string) => {
  await apiRequest(`/notifications/${id}/read`, { method: "POST" });
  return id;
});

export const markAllNotificationsRead = createAsyncThunk("notification/markAllRead", async () => {
  await apiRequest("/notifications/read-all", { method: "POST" });
});

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<{ notifications: AppNotification[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.notifications = action.payload.notifications;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action: PayloadAction<string>) => {
        const wasPresent = state.notifications.some((n) => n.id === action.payload);
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        if (wasPresent) state.unreadCount = Math.max(0, state.unreadCount - 1);
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
