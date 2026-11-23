import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserRole } from "@/types";

// Public Pages
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";

// Layout
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Student Pages
import { StudentDashboard } from "@/pages/student/StudentDashboard";
import { EquipmentCatalogue } from "@/pages/student/EquipmentCatalogue";
import { EquipmentDetail } from "@/pages/student/EquipmentDetail";
import { NewBookingPage } from "@/pages/student/NewBookingPage";
import { MyBookingsPage } from "@/pages/student/MyBookingsPage";
import { AIAssistantPage } from "@/pages/student/AIAssistantPage";
import { NotificationsPage } from "@/pages/student/NotificationsPage";
import { ProjectsPage } from "@/pages/student/ProjectsPage";

// Faculty Pages
import { FacultyDashboard } from "@/pages/faculty/FacultyDashboard";
import { ApprovalsPage } from "@/pages/faculty/ApprovalsPage";
import { FacultyEquipmentPage } from "@/pages/faculty/FacultyEquipmentPage";
import { FacultyCalendarPage } from "@/pages/faculty/FacultyCalendarPage";
import { FacultyAnalyticsPage } from "@/pages/faculty/FacultyAnalyticsPage";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminDepartmentsPage } from "@/pages/admin/AdminDepartmentsPage";
import { AdminBookingsPage } from "@/pages/admin/AdminBookingsPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";

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
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
