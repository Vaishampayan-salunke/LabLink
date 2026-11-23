import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, Cpu, Wrench, FileCheck2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const FacultyAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getFacultyAnalytics();
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Department Laboratory Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quantitative utilization statistics, peak demand equipment, and maintenance workload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Utilization Rate</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {analytics?.utilization_rate ?? 0}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Bookings</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {analytics?.active_bookings_count ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Scheduled Maintenance</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {analytics?.maintenance_count ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Requested Hardware */}
      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Highest Demand Laboratory Equipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading metrics...</div>
          ) : !analytics?.most_requested?.length ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No reservation history recorded for this department yet.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.most_requested.map((item: any) => (
                <div
                  key={item.equipment_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900">{item.equipment_name}</span>
                    <span className="text-[11px] text-slate-500 block">{item.category}</span>
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
