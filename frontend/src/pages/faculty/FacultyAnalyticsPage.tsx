import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, Cpu, Wrench, TrendingUp, BarChart3, Layers } from "lucide-react";

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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Department Utilization Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Laboratory Analytics & Workload
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Quantitative hardware allocation metrics, peak instrumentation demand, and preventive maintenance workload.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Utilization Rate
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#5945E8] dark:text-[#7968FF] mt-1 tabular-nums">
                {analytics?.utilization_rate ?? 0}%
              </p>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Active slot usage</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Active Bookings
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#0DAA78] dark:text-[#21C997] mt-1 tabular-nums">
                {analytics?.active_bookings_count ?? 0}
              </p>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Allocated sessions</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Scheduled Maintenance
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#E99A27] dark:text-[#F4B544] mt-1 tabular-nums">
                {analytics?.maintenance_count ?? 0}
              </p>
              <span className="text-[10px] text-[#E99A27] dark:text-[#F4B544] font-semibold">Calibration active</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FEF5E9] dark:bg-[#382408] text-[#E99A27] dark:text-[#F4B544] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Requested Hardware */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
            <span>Highest Demand Laboratory Equipment</span>
          </CardTitle>
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
            Frequency of student access requests across facilities
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading metrics...</div>
          ) : !analytics?.most_requested?.length ? (
            <div className="py-8 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">
              No reservation history recorded for this department yet.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.most_requested.map((item: any) => (
                <div
                  key={item.equipment_id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/60 hover:border-[#5945E8]/30 transition-all"
                >
                  <div>
                    <span className="font-bold text-xs text-[#172033] dark:text-[#F1F3FA]">{item.equipment_name}</span>
                    <span className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] block mt-0.5">{item.category}</span>
                  </div>
                  <Badge variant="default" className="text-xs font-bold bg-[#5945E8] text-white">
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
