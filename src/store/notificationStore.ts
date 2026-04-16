import { create } from 'zustand';
import { Notification, NotificationType } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
  getNotificationsByType: (type: NotificationType) => Notification[];
}

const dummyNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'officer-001',
    type: 'assignment',
    title: 'New Inspection Assigned',
    message: 'You have been assigned to inspect Delhi Public School, RK Puram. Please review the documents.',
    isRead: false,
    relatedId: 'insp-001',
    relatedType: 'inspection',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002',
    userId: 'officer-001',
    type: 'reminder',
    title: 'Inspection Due Tomorrow',
    message: 'Your inspection for Modern School, Barakhamba is assigned and requires document verification.',
    isRead: false,
    relatedId: 'insp-002',
    relatedType: 'inspection',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-003',
    userId: 'officer-001',
    type: 'alert',
    title: 'High Priority Inspection',
    message: 'A high priority inspection has been assigned to you. Please prioritize this assignment.',
    isRead: true,
    relatedId: 'insp-003',
    relatedType: 'inspection',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-004',
    userId: 'officer-001',
    type: 'update',
    title: 'Document Verified',
    message: 'The registration documents for St. Xavier\'s School have been verified successfully.',
    isRead: true,
    relatedId: 'insp-004',
    relatedType: 'document',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-005',
    userId: 'officer-001',
    type: 'system',
    title: 'System Maintenance',
    message: 'The system will undergo maintenance on Sunday, 2:00 AM - 4:00 AM. Plan accordingly.',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-006',
    userId: 'officer-001',
    type: 'assignment',
    title: 'Inspection Report Approved',
    message: 'Your inspection report for Don Bosco School has been approved by the supervisor.',
    isRead: false,
    relatedId: 'insp-005',
    relatedType: 'report',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: dummyNotifications,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ isLoading: false, notifications: dummyNotifications });
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === id
          ? { ...notif, isRead: true, readAt: new Date().toISOString() }
          : notif
      ),
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.isRead
          ? notif
          : { ...notif, isRead: true, readAt: new Date().toISOString() }
      ),
    }));
  },

  deleteNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notif => notif.id !== id),
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },

  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },
}));
