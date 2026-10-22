import { apiRequest } from './api';

export type OrionNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  createdAt: string;
  readAt: string | null;
};

export type NotificationList = { items: OrionNotification[]; unreadCount: number };

export function getNotifications(token: string) {
  return apiRequest<NotificationList>('/notifications', { headers: { Authorization: `Bearer ${token}` } });
}

export function markNotificationRead(id: number, token: string) {
  return apiRequest<NotificationList>(`/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<NotificationList>('/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}
