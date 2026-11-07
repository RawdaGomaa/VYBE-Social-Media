import { api, unwrapData } from "./api";

export type AppNotification = {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  actor?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    photo?: string;
    profilePhoto?: string;
    image?: string;
  };
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    photo?: string;
    profilePhoto?: string;
    image?: string;
  };
  post?: { _id?: string; id?: string } | string;
  postId?: string;
};

export type NotificationsPage = {
  notifications: AppNotification[];
  page?: number;
  totalPages?: number;
  total?: number;
};

function toNotificationList(payload: unknown): NotificationsPage {
  const data = unwrapData<unknown>(payload) as any;

  if (Array.isArray(data)) {
    return { notifications: data as AppNotification[] };
  }

  const notifications = data?.notifications ?? data?.items ?? data?.results ?? [];
  const meta = data?.pagination ?? data?.meta ?? {};

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    page: data?.page ?? meta?.page ?? meta?.currentPage,
    totalPages: data?.totalPages ?? meta?.totalPages ?? meta?.pages,
    total: data?.total ?? data?.totalCount ?? meta?.total ?? meta?.totalCount,
  };
}

export const notificationsApi = {
  async getNotifications(options: { unread?: boolean; page?: number; limit?: number } = {}) {
    const { unread = false, page = 1, limit = 10 } = options;
    const response = await api.get("/notifications", {
      params: { unread, page, limit },
    });
    return toNotificationList(response.data);
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread-count");
    const data = unwrapData<any>(response.data);
    return Number(data?.unreadCount ?? data?.count ?? data ?? 0) || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};

export function emitNotificationsChanged() {
  window.dispatchEvent(new Event("notifications:changed"));
}
