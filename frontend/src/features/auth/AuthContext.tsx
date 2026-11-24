import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; full_name: string; student_id?: string; department_id?: string }) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check per-tab sessionStorage first so multiple tabs run isolated personas
    const saved = sessionStorage.getItem("lablink_user") || localStorage.getItem("lablink_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Prioritize per-tab sessionStorage
      const token = sessionStorage.getItem("lablink_access_token") || localStorage.getItem("lablink_access_token");
      if (token) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
          sessionStorage.setItem("lablink_user", JSON.stringify(profile));
          // If this tab was relying on fallback, capture it in sessionStorage
          const activeAccessToken = sessionStorage.getItem("lablink_access_token") || localStorage.getItem("lablink_access_token");
          if (activeAccessToken) sessionStorage.setItem("lablink_access_token", activeAccessToken);
          const activeRefreshToken = sessionStorage.getItem("lablink_refresh_token") || localStorage.getItem("lablink_refresh_token");
          if (activeRefreshToken) sessionStorage.setItem("lablink_refresh_token", activeRefreshToken);
        } catch {
          setUser(null);
          sessionStorage.removeItem("lablink_access_token");
          sessionStorage.removeItem("lablink_user");
          localStorage.removeItem("lablink_access_token");
          localStorage.removeItem("lablink_user");
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      // Store in this tab's isolated sessionStorage
      sessionStorage.setItem("lablink_access_token", response.access_token);
      if (response.refresh_token) {
        sessionStorage.setItem("lablink_refresh_token", response.refresh_token);
      }
      sessionStorage.setItem("lablink_user", JSON.stringify(response.user));

      // Also set localStorage for newly opened tabs
      localStorage.setItem("lablink_access_token", response.access_token);
      if (response.refresh_token) {
        localStorage.setItem("lablink_refresh_token", response.refresh_token);
      }
      localStorage.setItem("lablink_user", JSON.stringify(response.user));

      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; student_id?: string; department_id?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      return await api.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
