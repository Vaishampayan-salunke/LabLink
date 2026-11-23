import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
} from "lucide-react";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getStudentAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 lg:p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
            Student Research Portal
          </Badge>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
            Discover precision instruments, development kits, and computing workstations across 5 academic departments. Submit project requests and check real-time availability.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/student/equipment")}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-md"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Browse Equipment
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/assistant")}
              className="border-indigo-400/40 bg-indigo-900/40 text-white hover:bg-indigo-800/60"
            >
              <Sparkles className="w-4 h-4 mr-2 text-indigo-300" />
              GenAI Project Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Upcoming Bookings</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.upcoming_bookings ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {analytics?.pending_approvals ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Completed Sessions</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {analytics?.completed_bookings ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.total_bookings ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Recent Equipment Reservations</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Live status updates from laboratory databases</p>
          </div>
          <Link
            to="/student/bookings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading reservation status...</div>
          ) : !analytics?.recent_activity?.length ? (
            <div className="py-12 text-center">
              <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No active bookings yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Explore our equipment catalogue and submit your first project reservation.
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/student/equipment")}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Available Gear
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analytics.recent_activity.map((item: any) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.equipment_name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{formatDate(item.start_time)}</span>
                      <span>•</span>
                      <span className="truncate max-w-xs">{item.purpose}</span>
                    </div>
                  </div>
                  <div>
                    <Badge
                      variant={
                        item.status === "CONFIRMED"
                          ? "success"
                          : item.status === "PENDING"
                          ? "warning"
                          : item.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
