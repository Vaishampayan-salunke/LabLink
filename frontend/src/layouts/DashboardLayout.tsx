import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/services/api";
import {
  LayoutDashboard,
  Cpu,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  Sparkles,
  Bell,
  LogOut,
  Users,
  Building2,
  Activity,
  History,
  Menu,
  X,
  ChevronRight,
  FolderOpen,
  Sun,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await api.getNotifications();
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } catch {
        // ignore
      }
    };
    fetchNotifs();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const role = user?.role || "STUDENT";

  const studentNav: NavItem[] = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Equipment Catalogue", href: "/student/equipment", icon: Cpu },
    { name: "My Bookings", href: "/student/bookings", icon: CalendarCheck },
    { name: "My Projects", href: "/student/projects", icon: FolderOpen },
    { name: "AI Assistant", href: "/student/assistant", icon: Sparkles },
    { name: "Notifications", href: "/student/notifications", icon: Bell, badge: unreadCount },
  ];

  const facultyNav: NavItem[] = [
    { name: "Department Overview", href: "/faculty/dashboard", icon: LayoutDashboard },
    { name: "Pending Approvals", href: "/faculty/approvals", icon: FileCheck2 },
    { name: "Equipment & Maintenance", href: "/faculty/equipment", icon: Cpu },
    { name: "Booking Timetable", href: "/faculty/calendar", icon: CalendarDays },
    { name: "Analytics & Usage", href: "/faculty/analytics", icon: Activity },
  ];

  const adminNav: NavItem[] = [
    { name: "Institution Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Directory", href: "/admin/users", icon: Users },
    { name: "Departments & Labs", href: "/admin/departments", icon: Building2 },
    { name: "Equipment Catalogue", href: "/admin/equipment", icon: Cpu },
    { name: "All Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Security Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  const navigation =
    role === "ADMIN" ? adminNav : role === "FACULTY" ? facultyNav : studentNav;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-300">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">LabLink</span>
            <span className="block text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Campus Lab Platform</span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-100 truncate">{user?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={role === "ADMIN" ? "destructive" : role === "FACULTY" ? "default" : "secondary"}
                  className="text-[9px] py-0 px-1.5 tracking-wider uppercase font-bold"
                >
                  {role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-1">
          {/* Theme toggle in sidebar */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-slate-900 dark:text-white font-semibold">{user?.role} Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-indigo-600 dark:text-indigo-400 capitalize">
                {location.pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === "STUDENT" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/student/assistant")}
                className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Ask AI
              </Button>
            )}

            {/* Theme toggle in header */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to={role === "STUDENT" ? "/student/notifications" : "#"}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              )}
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 z-20">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                  location.pathname === item.href
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Dynamic Outlet Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
