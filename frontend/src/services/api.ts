import {
  User,
  Equipment,
  Booking,
  Department,
  Laboratory,
  Notification,
  SchedulingRecommendationResponse,
  ProjectAnalysis,
  EquipmentMatchResult,
} from "@/types";

// Normalize base URL: strip trailing slashes and ensure /api/v1 is appended if user passed host URL
const getApiBase = (): string => {
  let base = (import.meta.env.VITE_API_BASE_URL as string) || "";
  base = base.trim().replace(/\/+$/, "");
  if (!base) {
    return "/api/v1";
  }
  if (!base.endsWith("/api/v1")) {
    base = `${base}/api/v1`;
  }
  return base;
};

const API_BASE = getApiBase();

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("lablink_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Attempt token refresh if available
      const refreshToken = localStorage.getItem("lablink_refresh_token");
      if (refreshToken && !endpoint.includes("/auth/refresh")) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("lablink_access_token", data.access_token);
            if (data.refresh_token) {
              localStorage.setItem("lablink_refresh_token", data.refresh_token);
            }
            // Retry original request
            return this.request<T>(endpoint, options);
          }
        } catch {
          // Fall through to error
        }
      }
      localStorage.removeItem("lablink_access_token");
      localStorage.removeItem("lablink_refresh_token");
      localStorage.removeItem("lablink_user");
    }

    if (!response.ok) {
      let errorMsg = "An error occurred with the request";
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {
        // use default
      }
      throw new Error(errorMsg);
    }

    // For 204 or empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { email: string; password: string; full_name: string; student_id?: string; department_id?: string }): Promise<User> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("lablink_access_token");
      localStorage.removeItem("lablink_refresh_token");
      localStorage.removeItem("lablink_user");
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request("/auth/me");
  }

  // Equipment
  async getEquipment(params: { search?: string; department_id?: string; category?: string; status?: string; is_restricted?: boolean; page?: number } = {}): Promise<Equipment[]> {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.department_id) query.append("department_id", params.department_id);
    if (params.category) query.append("category", params.category);
    if (params.status) query.append("status", params.status);
    if (params.is_restricted !== undefined) query.append("is_restricted", String(params.is_restricted));
    if (params.page) query.append("page", String(params.page));

    return this.request(`/equipment?${query.toString()}`);
  }

  async getEquipmentDetail(id: string): Promise<Equipment> {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    return this.request("/equipment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return this.request(`/equipment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async scheduleMaintenance(id: string, data: { start_time: string; end_time: string; reason: string; notes?: string }): Promise<any> {
    return this.request(`/equipment/${id}/maintenance`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Bookings
  async createBooking(data: {
    equipment_id: string;
    start_time: string;
    end_time: string;
    purpose: string;
    project_title?: string;
    project_description?: string;
    project_deadline?: string;
  }): Promise<Booking> {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyBookings(): Promise<Booking[]> {
    return this.request("/bookings/my");
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.request(`/bookings/${id}/cancel`, {
      method: "POST",
    });
  }

  async getSchedulingRecommendations(params: {
    equipment_id: string;
    start_time: string;
    end_time: string;
    deadline?: string;
  }): Promise<SchedulingRecommendationResponse> {
    const query = new URLSearchParams({
      equipment_id: params.equipment_id,
      start_time: params.start_time,
      end_time: params.end_time,
    });
    if (params.deadline) query.append("deadline", params.deadline);
    return this.request(`/bookings/recommendations?${query.toString()}`);
  }

  // Approvals (Faculty)
  async getPendingApprovals(): Promise<Booking[]> {
    return this.request("/approvals/pending");
  }

  async approveBooking(id: string, comments?: string): Promise<Booking> {
    return this.request(`/approvals/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ decision: "APPROVED", comments }),
    });
  }

  async rejectBooking(id: string, rejection_reason: string): Promise<Booking> {
    return this.request(`/approvals/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ decision: "REJECTED", rejection_reason }),
    });
  }

  // AI
  async analyzeProject(project_description: string): Promise<ProjectAnalysis> {
    return this.request("/ai/project-analyze", {
      method: "POST",
      body: JSON.stringify({ project_description }),
    });
  }

  async recommendEquipment(project_description: string): Promise<{ matched_equipment: EquipmentMatchResult[]; alternatives: EquipmentMatchResult[]; guidance: string }> {
    return this.request("/ai/equipment-recommend", {
      method: "POST",
      body: JSON.stringify({ project_description }),
    });
  }

  async chatWithAI(message: string, conversation_history: any[] = []): Promise<{ reply: string; suggested_equipment: EquipmentMatchResult[] }> {
    return this.request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversation_history }),
    });
  }

  // Departments & Labs
  async getDepartments(): Promise<Department[]> {
    return this.request("/departments");
  }

  async createDepartment(data: { name: string; code: string; description?: string }): Promise<Department> {
    return this.request("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createLaboratory(data: Partial<Laboratory>): Promise<Laboratory> {
    return this.request("/departments/laboratories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getStudentAnalytics(): Promise<any> {
    return this.request("/analytics/student");
  }

  async getFacultyAnalytics(): Promise<any> {
    return this.request("/analytics/faculty");
  }

  async getAdminAnalytics(): Promise<any> {
    return this.request("/analytics/admin");
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.request("/notifications");
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    return this.request(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request("/notifications/read-all", {
      method: "POST",
    });
  }

  // Admin
  async getAdminUsers(): Promise<User[]> {
    return this.request("/admin/users");
  }

  async updateUserStatus(id: string, data: { is_active?: boolean; department_id?: string }): Promise<User> {
    return this.request(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.request("/admin/bookings");
  }

  async getAuditLogs(): Promise<any[]> {
    return this.request("/admin/audit-logs");
  }

  // Projects
  async getProjects(): Promise<any[]> {
    return this.request("/projects");
  }

  async createProject(data: { title: string; description: string; domain?: string; deadline?: string; team_members?: string[] }): Promise<any> {
    return this.request("/projects", { method: "POST", body: JSON.stringify(data) });
  }

  async updateProject(id: string, data: Partial<{ title: string; description: string; domain: string; status: string; deadline: string }>): Promise<any> {
    return this.request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  // Waitlist
  async joinWaitlist(data: { equipment_id: string; notes?: string }): Promise<any> {
    return this.request("/waitlist", { method: "POST", body: JSON.stringify(data) });
  }

  async getMyWaitlist(): Promise<any[]> {
    return this.request("/waitlist/my");
  }

  async cancelWaitlist(id: string): Promise<void> {
    return this.request(`/waitlist/${id}`, { method: "DELETE" });
  }

  // Equipment Units (QR)
  async getEquipmentUnits(equipmentId: string): Promise<any[]> {
    return this.request(`/equipment/${equipmentId}/units`);
  }

  async qrCheckIn(data: { unit_serial: string; booking_id: string }): Promise<any> {
    return this.request("/qr/check-in", { method: "POST", body: JSON.stringify(data) });
  }

  async qrCheckOut(data: { unit_serial: string; booking_id: string; condition_notes?: string }): Promise<any> {
    return this.request("/qr/check-out", { method: "POST", body: JSON.stringify(data) });
  }

  // Fault Reports
  async reportFault(equipmentId: string, data: { fault_description: string; severity: string }): Promise<any> {
    return this.request(`/equipment/${equipmentId}/fault-reports`, { method: "POST", body: JSON.stringify(data) });
  }

  async getFaultReports(equipmentId: string): Promise<any[]> {
    return this.request(`/equipment/${equipmentId}/fault-reports`);
  }

  // Analytics CSV Export
  async exportBookingsCSV(): Promise<Blob> {
    const token = localStorage.getItem("lablink_access_token");
    const response = await fetch(`${API_BASE}/analytics/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.blob();
  }
}

export const api = new ApiClient();

// Axios-compatible thin wrapper for TanStack Query usage
export const apiClient = {
  get: (url: string, config?: any) => api["request"](url, { ...(config || {}) }).then((data: any) => ({ data })),
  post: (url: string, body?: any, config?: any) =>
    api["request"](url, { method: "POST", body: JSON.stringify(body), ...(config || {}) }).then((data: any) => ({ data })),
  patch: (url: string, body?: any, config?: any) =>
    api["request"](url, { method: "PATCH", body: JSON.stringify(body), ...(config || {}) }).then((data: any) => ({ data })),
  delete: (url: string, config?: any) =>
    api["request"](url, { method: "DELETE", ...(config || {}) }).then((data: any) => ({ data })),
};
