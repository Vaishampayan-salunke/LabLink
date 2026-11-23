import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  FileCheck2,
  Cpu,
  Activity,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
} from "lucide-react";

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, pending] = await Promise.all([
          api.getFacultyAnalytics(),
          api.getPendingApprovals(),
        ]);
        setAnalytics(stats);
        setPendingApprovals(pending);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Faculty Coordinator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department laboratory oversight, student access requests, and equipment scheduling.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/faculty/approvals")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          >
            <FileCheck2 className="w-4 h-4 mr-1.5" />
            Review Pending Requests ({pendingApprovals.length})
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {analytics?.pending_approvals_count ?? pendingApprovals.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Department Gear</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.department_equipment_count ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Active Bookings</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {analytics?.active_bookings_count ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Utilization Rate</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {analytics?.utilization_rate ?? 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Awaiting Your Faculty Decision
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Review project requirements and student justifications
            </p>
          </div>
          <Link
            to="/faculty/approvals"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Open Approvals Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading requests...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="py-12 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No pending approvals</p>
              <p className="text-xs text-slate-400 mt-1">
                All laboratory requests for your department have been reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApprovals.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.equipment_name}</span>
                      <Badge variant="warning" className="text-[10px]">
                        Pending Review
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">
                        {item.student_name} ({item.student_email})
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.start_time)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold">Purpose: </span>
                      {item.purpose}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate("/faculty/approvals")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs self-start sm:self-auto shrink-0"
                  >
                    Review Request
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
