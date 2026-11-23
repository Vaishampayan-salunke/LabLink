import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Building2,
  Cpu,
  CalendarCheck,
  CheckCircle2,
  Activity,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAdminAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Institution Administrative Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Campus-wide laboratory infrastructure utilization, booking trends, and departmental resource metrics.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Users</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
              {analytics?.total_users ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Departments</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
              {analytics?.total_departments ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Laboratories</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
              {analytics?.total_laboratories ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Equipment Gear</span>
            <span className="text-xl font-extrabold text-indigo-600 mt-0.5 block">
              {analytics?.total_equipment ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Bookings</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">
              {analytics?.total_bookings ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Approval Rate</span>
            <span className="text-xl font-extrabold text-purple-600 mt-0.5 block">
              {analytics?.approval_rate ?? 100}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Volume Trends */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>7-Day Campus Booking Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.booking_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#6366f1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department-wise Utilization */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Department Resource Utilization (%)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.department_utilization || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category_or_dept" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                    <Bar dataKey="utilization_rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Requested Hardware Table */}
      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Institution-Wide High Demand Equipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading records...</div>
          ) : !analytics?.most_requested_equipment?.length ? (
            <div className="py-8 text-center text-xs text-slate-400">No booking records yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analytics.most_requested_equipment.map((item: any) => (
                <div key={item.equipment_id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.equipment_name}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {item.department_name} • {item.category}
                    </span>
                  </div>
                  <Badge variant="default" className="text-xs font-bold">
                    {item.booking_count} Bookings
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
