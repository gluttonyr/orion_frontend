import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Home,
  BarChart3,
  Briefcase,
  MessageCircle,
  User,
  ShoppingBag,
  Package,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCheck,
  Store,
  ChevronDown,
  Crown,
  Wallet
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { currentUserType, isMerchant, isEntrepreneur } from "../lib/user-context";
import { useNotifications } from "../lib/notification-context";
import { useStore } from "../lib/store-context";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotifications();
  const { activeStore } = useStore();

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.link) {
      setNotificationOpen(false);
      navigate(notif.link);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Navigation pour les commerçants
  const merchantNavItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: Home },
    { path: "/dashboard/stores", label: "Mes Boutiques", icon: Store },
    { path: "/dashboard/products", label: "Mes Produits", icon: Package },
    { path: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/dashboard/wallet", label: "Portefeuille", icon: Wallet },
    { path: "/dashboard/analytics", label: "Analyses", icon: BarChart3 },
    { path: "/dashboard/opportunities", label: "Opportunités", icon: Briefcase },
    { path: "/dashboard/subscriptions", label: "Abonnements", icon: Crown },
    { path: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { path: "/dashboard/profile", label: "Profil", icon: User },
  ];

  // Navigation pour les entrepreneurs
  const entrepreneurNavItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: Home },
    { path: "/dashboard/opportunities", label: "Opportunités", icon: Briefcase },
    { path: "/dashboard/analytics", label: "Analyses", icon: BarChart3 },
    { path: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { path: "/dashboard/profile", label: "Profil", icon: User },
  ];

  // Sélectionner les items selon le type d'utilisateur
  const navItems = isMerchant() ? merchantNavItems : entrepreneurNavItems;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b-4 border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <span className="text-xl font-semibold text-primary">Orion</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors border-2 border-transparent hover:border-primary"
              >
                <Bell className="w-6 h-6" />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {getUnreadCount()}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-4 border-gray-200 shadow-lg max-h-[500px] overflow-hidden flex flex-col z-50">
                  {/* Header */}
                  <div className="p-4 border-b-4 border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {getUnreadCount() > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {getUnreadCount()} non lu{getUnreadCount() > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full p-4 text-left border-b-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95 ${
                            !notif.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 text-sm font-bold ${getNotificationColor(
                                notif.type
                              )}`}
                            >
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {notif.title}
                                </h4>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-secondary flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1 break-words">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getTimeAgo(notif.timestamp)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-primary transition-colors border-2 border-transparent hover:border-primary"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header on mobile */}
      <div className="h-16 lg:hidden"></div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r-4 border-gray-200 transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } w-64 lg:top-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo - Desktop with Notification */}
            <div className="hidden lg:flex items-center justify-between px-6 h-16 border-b-4 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="text-2xl font-semibold text-primary">Orion</span>
              </div>

              {/* Desktop Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors border-2 border-transparent hover:border-primary"
                >
                  <Bell className="w-5 h-5" />
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {getUnreadCount()}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown - Desktop */}
                {notificationOpen && (
                  <div className="absolute left-full ml-2 top-0 w-96 bg-white border-4 border-gray-200 shadow-lg max-h-[600px] overflow-hidden flex flex-col z-50">
                    {/* Header */}
                    <div className="p-4 border-b-4 border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {getUnreadCount() > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Tout marquer lu
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {getUnreadCount()} non lu{getUnreadCount() > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Aucune notification</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full p-4 text-left border-b-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95 ${
                              !notif.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 text-sm font-bold ${getNotificationColor(
                                  notif.type
                                )}`}
                              >
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {notif.title}
                                  </h4>
                                  {!notif.read && (
                                    <div className="w-2 h-2 bg-secondary flex-shrink-0 mt-1"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1 break-words">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getTimeAgo(notif.timestamp)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo - Mobile (au-dessus du menu) */}
            <div className="lg:hidden flex items-center gap-2 px-6 h-16 border-b-4 border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-2xl font-semibold text-primary">Orion</span>
            </div>

            {/* Active Store - For Merchants */}
            {isMerchant() && activeStore && (
              <div className="px-4 py-4 border-b-4 border-gray-200">
                <Link
                  to="/store-selection"
                  className="w-full bg-gradient-to-r from-primary to-secondary border-2 border-primary p-3 text-white hover:opacity-90 transition-opacity flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {activeStore.logo ? (
                        <img
                          src={activeStore.logo}
                          alt={activeStore.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs opacity-90">Boutique active</p>
                      <p className="font-bold text-sm truncate">
                        {activeStore.name}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Link>
              </div>
            )}

            {/* No Active Store - For Merchants */}
            {isMerchant() && !activeStore && (
              <div className="px-4 py-4 border-b-4 border-gray-200">
                <Link
                  to="/store-selection"
                  className="w-full bg-orange-100 border-2 border-orange-300 p-3 text-orange-800 hover:bg-orange-200 transition-colors flex items-center gap-2"
                >
                  <Store className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Sélectionner une boutique</p>
                    <p className="text-xs">Aucune boutique active</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition-all border-2 ${
                        active
                          ? "bg-primary text-white shadow-md border-primary"
                          : "text-gray-700 hover:bg-gray-100 border-transparent hover:border-gray-200"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User Section */}
            <div className="border-t-4 border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center text-white font-medium flex-shrink-0">
                  {isMerchant() ? "CM" : "EN"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {isMerchant() ? "Commerçant" : "Entrepreneur"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">Dakar, Sénégal</p>
                </div>
              </div>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full border-2 border-transparent hover:border-gray-200"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Déconnexion</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}