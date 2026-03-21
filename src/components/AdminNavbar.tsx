import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  Package,
  Tag,
  ShoppingCart,
  Ticket,
  Receipt,
  Users,
  Sun,
  Moon,
  Calculator,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { cn } from '../utils';
import { Dropdown } from './Dropdown';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Receipt, label: 'Taxes', path: '/admin/taxes' },
  { icon: Calculator, label: 'Accounting', path: '/admin/accounting' },
  { icon: BookOpen, label: 'Bookkeeping', path: '/admin/bookkeeping' },
];

export const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { notifications, unreadCount, markAllAsRead } = useAdminNotifications();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="h-16 bg-white dark:bg-zinc-950 border-b border-[#E5E5E5] dark:border-zinc-800 sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl transition-colors"
          >
            <Menu className="h-5 w-5 dark:text-white" />
          </button>

          <Link to="/" className="text-xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
            PERFUME<span className="font-sans font-light text-accent-dark">BUDGET</span>
            <span className="ml-2 text-[10px] bg-accent text-[#1A1A1A] px-2 py-0.5 rounded-full uppercase tracking-widest font-sans font-bold">Admin</span>
          </Link>

        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <input
              type="text"
              placeholder="Search analytics..."
              className="pl-10 pr-4 py-2 bg-[#F5F5F5] dark:bg-zinc-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent w-48 transition-all focus:w-64 dark:text-white"
            />
          </div>

          {/* Theme toggle — hidden on mobile to prevent navbar overflow */}
          <div className="hidden sm:block">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-accent-dark"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) markAllAsRead();
              }}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl transition-colors relative"
            >
              <Bell className="h-5 w-5 text-[#666666] dark:text-zinc-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-zinc-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#F5F5F5] dark:border-zinc-800 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-[#F5F5F5] dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
                  <h3 className="text-sm font-bold dark:text-white">Notifications</h3>
                  <span className="text-xs text-[#999999]">{notifications.length} total</span>
                </div>
                <div className="flex flex-col">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[#999999]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <Link
                        key={idx}
                        to={`/admin/orders/${notif.orderNumber}`}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block px-4 py-3 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 transition-colors border-b border-[#F5F5F5] dark:border-zinc-800 last:border-0"
                      >
                        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
                          {notif.message}
                        </p>
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            Order: {notif.orderNumber}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                            {notif.totalAmount}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t border-[#F5F5F5] dark:border-zinc-800 pt-2">
                          <span className="text-[10px] font-medium text-accent-dark">
                            {notif.customerEmail}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(notif.placedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold dark:text-white">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-[#999999] uppercase tracking-widest font-bold">Super Admin</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-[#999999] transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#F5F5F5] dark:border-zinc-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-[#F5F5F5] dark:border-zinc-800 mb-2">
                  <p className="text-sm font-bold dark:text-white">{user?.name}</p>
                  <p className="text-xs text-[#999999]">{user?.email}</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 transition-colors">
                  <User className="h-4 w-4" />
                  Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 transition-colors">
                  <Settings className="h-4 w-4" />
                  Store Settings
                </button>
                <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800 my-2" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-[#F5F5F5] dark:border-zinc-800 flex items-center justify-between">
              <Link to="/" className="text-lg font-serif font-bold dark:text-white">
                PERFUME<span className="font-sans font-light text-accent-dark">BUDGET</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-accent text-[#1A1A1A] font-bold'
                          : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-6 border-t border-[#F5F5F5] dark:border-zinc-800 space-y-1">
              {/* Theme toggle in mobile sidebar */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-xl w-full transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
