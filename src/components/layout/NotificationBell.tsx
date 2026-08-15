"use client";

import { useEffect, useRef, useState } from "react";
import { MdNotifications, MdPersonAdd, MdPersonRemove, MdEdit, MdVpnKey, MdStorefront, MdDiamond } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/redux/slices/notificationSlice";
import type { AppNotification, NotificationType } from "@/types/notification";

const POLL_INTERVAL_MS = 25000;

const TYPE_ICON: Record<NotificationType, typeof MdPersonAdd> = {
  employee_created: MdPersonAdd,
  employee_deleted: MdPersonRemove,
  employee_updated: MdEdit,
  role_created: MdVpnKey,
  role_updated: MdVpnKey,
  showroom_created: MdStorefront,
  showroom_deleted: MdStorefront,
  brand_created: MdDiamond,
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationRow({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const Icon = TYPE_ICON[notification.type] ?? MdNotifications;
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className="flex w-full items-start gap-3 rounded-xl bg-primary/5 px-3 py-2.5 text-left hover:bg-primary/10"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink">{notification.message}</span>
        <span className="mt-0.5 block text-caption text-ink-muted">
          {notification.actorName ? `${notification.actorName} · ` : ""}
          {timeAgo(notification.createdAt)}
        </span>
      </span>
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
    </button>
  );
}

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) dispatch(fetchNotifications({ limit: 20 }));
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-surface-tint hover:text-primary"
        aria-label="Notifications"
      >
        <MdNotifications size={21} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 max-h-[28rem] w-80 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-floating sm:w-96">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="font-heading text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-caption font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">You&apos;re all caught up.</p>
          ) : (
            <div className="space-y-0.5">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={(id) => dispatch(markNotificationRead(id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
