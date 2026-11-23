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
  QrCode,
  ShieldAlert,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  section?: "workspace" | "tools";
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

  const studentWorkspace: NavItem[] = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Explore Equipment", href: "/student/equipment", icon: Cpu },
    { name: "My Bookings", href: "/student/bookings", icon: CalendarCheck },
    { name: "My Projects", href: "/student/projects", icon: FolderOpen },
  ];

  const studentTools: NavItem[] = [
    { name: "AI Lab Assistant", href: "/student/assistant", icon: Sparkles },
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

  return (
    <div className="flex h-screen bg-[#F6F7FB] dark:bg-[#0B1020] text-[#172033] dark:text-[#F1F3FA] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#10182B] dark:bg-[#080D19] border-r border-[#1B253D] text-[#A0ABC0] select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1B253D] bg-[#0C1324]/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5945E8] to-[#8170F5] flex items-center justify-center text-white shadow-md shadow-[#5945E8]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-heading font-extrabold tracking-tight text-white">LabLink</span>
            <span className="block text-[9px] uppercase font-bold text-[#A394FF] tracking-widest">
              Campus Platform
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 border-b border-[#1B253D]/80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#151D30]/70 border border-[#202B45]">
            <div className="w-8 h-8 rounded-lg bg-[#5945E8]/20 text-[#A394FF] flex items-center justify-center font-heading font-bold text-xs uppercase border border-[#5945E8]/30">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0DAA78]"></span>
                <span className="text-[10px] text-[#A0ABC0] uppercase tracking-wider font-semibold">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {role === "STUDENT" ? (
            <>
              <div>
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#68758B] block mb-1.5">
                  Workspace
                </span>
                <div className="space-y-1">
                  {studentWorkspace.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#5945E8] text-white shadow-sm font-semibold"
                            : "text-[#A0ABC0] hover:text-white hover:bg-[#151D30]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#68758B]"}`} />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#68758B] block mb-1.5">
                  Tools & Updates
                </span>
                <div className="space-y-1">
                  {studentTools.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#5945E8] text-white shadow-sm font-semibold"
                            : "text-[#A0ABC0] hover:text-white hover:bg-[#151D30]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#68758B]"}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#E34E62] text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#68758B] block mb-1.5">
                {role === "ADMIN" ? "Admin Console" : "Department Management"}
              </span>
              {(role === "ADMIN" ? adminNav : facultyNav).map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#5945E8] text-white shadow-sm font-semibold"
                        : "text-[#A0ABC0] hover:text-white hover:bg-[#151D30]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#68758B]"}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#1B253D] space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-[#A0ABC0] hover:text-white hover:bg-[#151D30] rounded-xl transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-[#F4B544]" /> : <Moon className="w-4 h-4 text-[#A394FF]" />}
            <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-[#F16B7B] hover:bg-[#E34E62]/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#10182B] border-b border-[#E2E8F0] dark:border-[#1F2C4A] px-4 lg:px-8 flex items-center justify-between z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#68758B] dark:text-[#A0ABC0] hover:bg-[#F6F7FB] dark:hover:bg-[#151D30]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-[#68758B] dark:text-[#A0ABC0]">
              <span className="font-heading font-semibold text-[#172033] dark:text-[#F1F3FA] capitalize">
                {user?.role?.toLowerCase()} Workspace
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#68758B]" />
              <span className="text-[#5945E8] dark:text-[#7968FF] capitalize font-medium">
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
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5945E8] bg-[#EEF0FA] dark:bg-[#1C2642] dark:text-[#A394FF] border border-[#5945E8]/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                Ask AI Assistant
              </Button>
            )}

            {/* Quick Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#68758B] dark:text-[#A0ABC0] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F7FB] dark:hover:bg-[#151D30] rounded-xl transition-colors"
              title={theme === "dark" ? "Light theme" : "Dark theme"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F4B544]" /> : <Moon className="w-4 h-4 text-[#5945E8]" />}
            </button>

            <Link
              to={role === "STUDENT" ? "/student/notifications" : "#"}
              className="relative p-2 text-[#68758B] dark:text-[#A0ABC0] hover:text-[#172033] dark:hover:text-white hover:bg-[#F6F7FB] dark:hover:bg-[#151D30] rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E34E62] animate-pulse"></span>
              )}
            </Link>

            <div className="h-5 w-px bg-[#E2E8F0] dark:bg-[#1F2C4A]"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EEF0FA] dark:bg-[#151D30] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center font-heading font-bold text-xs border border-[#E2E8F0] dark:border-[#1F2C4A]">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] leading-tight">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#10182B] border-b border-[#1B253D] p-4 space-y-1 z-20 text-[#A0ABC0]">
            {(role === "STUDENT" ? [...studentWorkspace, ...studentTools] : role === "ADMIN" ? adminNav : facultyNav).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                  location.pathname === item.href
                    ? "bg-[#5945E8] text-white"
                    : "text-[#A0ABC0] hover:bg-[#151D30]"
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
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-[#F16B7B] hover:bg-[#E34E62]/10 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Dynamic Outlet Body */}
        <main className="flex-1 overflow-y-auto bg-[#F6F7FB] dark:bg-[#0B1020] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
