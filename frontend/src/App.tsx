import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserRole } from "@/types";

// Layout
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Code-split route components for high Lighthouse efficiency & small initial payload
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));

// Student Pages
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const EquipmentCatalogue = lazy(() => import("@/pages/student/EquipmentCatalogue").then(m => ({ default: m.EquipmentCatalogue })));
const EquipmentDetail = lazy(() => import("@/pages/student/EquipmentDetail").then(m => ({ default: m.EquipmentDetail })));
const NewBookingPage = lazy(() => import("@/pages/student/NewBookingPage").then(m => ({ default: m.NewBookingPage })));
const MyBookingsPage = lazy(() => import("@/pages/student/MyBookingsPage").then(m => ({ default: m.MyBookingsPage })));
const AIAssistantPage = lazy(() => import("@/pages/student/AIAssistantPage").then(m => ({ default: m.AIAssistantPage })));
const NotificationsPage = lazy(() => import("@/pages/student/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const ProjectsPage = lazy(() => import("@/pages/student/ProjectsPage").then(m => ({ default: m.ProjectsPage })));

// Faculty Pages
const FacultyDashboard = lazy(() => import("@/pages/faculty/FacultyDashboard").then(m => ({ default: m.FacultyDashboard })));
const ApprovalsPage = lazy(() => import("@/pages/faculty/ApprovalsPage").then(m => ({ default: m.ApprovalsPage })));
const FacultyEquipmentPage = lazy(() => import("@/pages/faculty/FacultyEquipmentPage").then(m => ({ default: m.FacultyEquipmentPage })));
const FacultyCalendarPage = lazy(() => import("@/pages/faculty/FacultyCalendarPage").then(m => ({ default: m.FacultyCalendarPage })));
const FacultyAnalyticsPage = lazy(() => import("@/pages/faculty/FacultyAnalyticsPage").then(m => ({ default: m.FacultyAnalyticsPage })));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminDepartmentsPage = lazy(() => import("@/pages/admin/AdminDepartmentsPage").then(m => ({ default: m.AdminDepartmentsPage })));
const AdminBookingsPage = lazy(() => import("@/pages/admin/AdminBookingsPage").then(m => ({ default: m.AdminBookingsPage })));
const AuditLogsPage = lazy(() => import("@/pages/admin/AuditLogsPage").then(m => ({ default: m.AuditLogsPage })));

const PageFallback: React.FC = () => (
  <div className="min-h-screen bg-[#F6F7FB] dark:bg-[#0B1020] flex items-center justify-center">
    <div className="flex items-center gap-3 text-xs font-semibold text-[#5945E8] dark:text-[#7968FF]">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>Loading LabLink workspace...</span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
        Verifying institutional access...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "FACULTY") return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="equipment" element={<EquipmentCatalogue />} />
                  <Route path="equipment/:id" element={<EquipmentDetail />} />
                  <Route path="booking/new" element={<NewBookingPage />} />
                  <Route path="bookings" element={<MyBookingsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="assistant" element={<AIAssistantPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                {/* Faculty Protected Routes */}
                <Route
                  path="/faculty"
                  element={
                    <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="approvals" element={<ApprovalsPage />} />
                  <Route path="equipment" element={<FacultyEquipmentPage />} />
                  <Route path="calendar" element={<FacultyCalendarPage />} />
                  <Route path="analytics" element={<FacultyAnalyticsPage />} />
                </Route>

                {/* Administrator Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="departments" element={<AdminDepartmentsPage />} />
                  <Route path="equipment" element={<EquipmentCatalogue />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                </Route>

                {/* Catch-all redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
