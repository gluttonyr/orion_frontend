import { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock notifications initiales
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvelle commande",
    message: "Vous avez reçu une nouvelle commande pour le produit MacBook Pro",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    link: "/dashboard",
  },
  {
    id: "2",
    title: "Candidature reçue",
    message: "Un nouveau candidat a postulé pour votre opportunité 'Développeur Web'",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    link: "/dashboard/opportunities",
  },
  {
    id: "3",
    title: "Stock faible",
    message: "Le produit 'iPhone 13 Pro' a un stock faible (3 unités restantes)",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: "/dashboard/products",
  },
  {
    id: "4",
    title: "Paiement reçu",
    message: "Vous avez reçu un paiement de 450,000 FCFA",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    link: "/dashboard/analytics",
  },
  {
    id: "5",
    title: "Message reçu",
    message: "Fatou B. vous a envoyé un nouveau message",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: "/dashboard/messages",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
