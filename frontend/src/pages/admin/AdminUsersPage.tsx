import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { User, UserRole } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle2, UserCheck } from "lucide-react";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.updateUserStatus(user.id, { is_active: !user.is_active });
      await fetchUsers();
    } catch (e) {
      alert("Failed to update user status");
    }
  };

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Identity & Access Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Manage authenticated students, faculty coordinators, and administrative accounts with role-based permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-10 px-3 rounded-[10px] border border-[#1F2C4A] bg-[#10182B] text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#7968FF]"
          >
            <option value="">All Roles ({users.length})</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading user accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172033] dark:text-[#F1F3FA]">
                <thead className="bg-[#F6F7FB] dark:bg-[#10182B] border-b border-[#E2E8F0] dark:border-[#1F2C4A] text-[#68758B] dark:text-[#A0ABC0] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Full Name & Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F6F7FB]/50 dark:hover:bg-[#10182B]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[#172033] dark:text-[#F1F3FA] block">{u.full_name}</span>
                        <span className="text-[#68758B] dark:text-[#A0ABC0] text-[11px]">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={u.role === "ADMIN" ? "destructive" : u.role === "FACULTY" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                        {u.student_id || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.is_active ? "success" : "destructive"} className="text-[10px]">
                          {u.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#68758B] dark:text-[#A0ABC0] text-[11px]">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== "ADMIN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(u)}
                            className="text-[11px] h-7 px-2.5"
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
