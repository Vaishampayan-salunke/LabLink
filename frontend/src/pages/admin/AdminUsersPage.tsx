import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { User, UserRole } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated students, faculty coordinators, and administrative accounts.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading user accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Full Name & Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{u.full_name}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={u.role === "ADMIN" ? "destructive" : u.role === "FACULTY" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                        {u.student_id || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.is_active ? "success" : "destructive"} className="text-[10px]">
                          {u.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
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
