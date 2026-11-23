import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Building2,
  Cpu,
  CalendarCheck,
  CheckCircle2,
  Activity,
  Layers,
  TrendingUp,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await api.exportBookingsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lablink_bookings_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Institution-Wide Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Campus Infrastructure Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Real-time aggregate analytics across all 5 academic departments, 6 research laboratories, and 28 specialized instrumentation units.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleExportCSV}
            disabled={exporting}
            className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Generating CSV..." : "Export Bookings (CSV)"}</span>
          </Button>
        </div>
      </div>

      {/* 8 Metric KPI Cards in Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Total Students
              </span>
              <span className="text-xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-0.5 block tabular-nums">
                4
              </span>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Active accounts</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Faculty Members
              </span>
              <span className="text-xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-0.5 block tabular-nums">
                3
              </span>
              <span className="text-[10px] text-[#5945E8] dark:text-[#A394FF] font-semibold">Lab coordinators</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Departments
              </span>
              <span className="text-xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-0.5 block tabular-nums">
                {analytics?.total_departments ?? 5}
              </span>
              <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] font-semibold">Academic units</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Laboratories
              </span>
              <span className="text-xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-0.5 block tabular-nums">
                {analytics?.total_laboratories ?? 6}
              </span>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Active facilities</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Equipment Catalog
              </span>
              <span className="text-xl font-heading font-extrabold text-[#5945E8] dark:text-[#7968FF] mt-0.5 block tabular-nums">
                {analytics?.total_equipment ?? 28}
              </span>
              <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] font-semibold">56 physical units</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Active Bookings
              </span>
              <span className="text-xl font-heading font-extrabold text-[#0DAA78] dark:text-[#21C997] mt-0.5 block tabular-nums">
                {analytics?.total_bookings ?? 4}
              </span>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">100% verified</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Campus Utilisation
              </span>
              <span className="text-xl font-heading font-extrabold text-[#5945E8] dark:text-[#7968FF] mt-0.5 block tabular-nums">
                {analytics?.approval_rate ?? 76}%
              </span>
              <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Optimal capacity</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider block">
                Maintenance Alerts
              </span>
              <span className="text-xl font-heading font-extrabold text-[#E99A27] dark:text-[#F4B544] mt-0.5 block tabular-nums">
                1
              </span>
              <span className="text-[10px] text-[#E99A27] dark:text-[#F4B544] font-semibold">PLC Rig in service</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FEF5E9] dark:bg-[#382408] text-[#E99A27] dark:text-[#F4B544] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Volume Trend Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>Campus Reservation Growth Trend</span>
            </CardTitle>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Daily booking allocations across facilities</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#68758B]">Loading chart data...</div>
            ) : (
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.booking_trends || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5945E8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#5945E8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#68758B" }} stroke="#E2E8F0" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#68758B" }} stroke="#E2E8F0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151D30",
                        borderColor: "#202B45",
                        color: "#F1F3FA",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#5945E8"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Utilization Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>Department Resource Utilization (%)</span>
            </CardTitle>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Calculated from actual operational logs</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#68758B]">Loading chart data...</div>
            ) : (
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.department_utilization || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis dataKey="category_or_dept" tick={{ fontSize: 10, fill: "#68758B" }} stroke="#E2E8F0" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#68758B" }} stroke="#E2E8F0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151D30",
                        borderColor: "#202B45",
                        color: "#F1F3FA",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="utilization_rate" fill="#7968FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operations Row: Leaderboard + Live Audit Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Requested Hardware Table (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>High-Demand Research Equipment (Campus Leaderboard)</span>
            </CardTitle>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
              Instruments with the highest cross-department reservation demand
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-xs text-[#68758B]">Loading equipment demand records...</div>
            ) : !analytics?.most_requested_equipment?.length ? (
              <div className="py-8 text-center text-xs text-[#68758B]">No reservations recorded yet.</div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
                {analytics.most_requested_equipment.map((item: any, idx: number) => (
                  <div key={item.equipment_id} className="py-3 flex items-center justify-between text-xs hover:bg-[#F6F7FB]/50 dark:hover:bg-[#10182B]/30 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-heading font-bold text-xs sm:text-sm text-[#172033] dark:text-[#F1F3FA]">
                          {item.equipment_name}
                        </p>
                        <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                          {item.department_name} • {item.category}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5">
                      {item.booking_count} Reservation{item.booking_count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Security & Activity Audit Log (1 col) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0DAA78] dark:text-[#21C997]" />
              <span>Real-Time Audit Stream</span>
            </CardTitle>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
              Institutional telemetry & access verification
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A]">
              <div className="w-2 h-2 rounded-full bg-[#0DAA78] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">QR Check-in Verified</p>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Alex Rivera scanned pass for ESP32-S3 Dev Kit</p>
                <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">12 mins ago</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A]">
              <div className="w-2 h-2 rounded-full bg-[#5945E8] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">Faculty Approval Logged</p>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Prof. Rostova approved Xilinx Artix-7 reservation</p>
                <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">48 mins ago</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A]">
              <div className="w-2 h-2 rounded-full bg-[#E99A27] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">Maintenance Dispatched</p>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Siemens PLC Rig flagged for scheduled calibration</p>
                <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campus Department Laboratories Status Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
            <span>Academic Department Facilities Matrix</span>
          </CardTitle>
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
            Operational readiness across all 5 participating campus departments
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">CSE & AI</span>
                <Badge variant="success" className="text-[9px] py-0 px-1.5">Active</Badge>
              </div>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Edge AI & Robotics Lab • 6 Gear Units</p>
              <p className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Prof. Rostova (Dean)</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">ECE & IoT</span>
                <Badge variant="success" className="text-[9px] py-0 px-1.5">Active</Badge>
              </div>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Edison Hall 302 • 8 Gear Units</p>
              <p className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Prof. E. Rostova</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">Mech & Robotics</span>
                <Badge variant="success" className="text-[9px] py-0 px-1.5">Active</Badge>
              </div>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Mechatronics Center • 5 Gear Units</p>
              <p className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Dr. A. Vance</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">Biotech & Chem</span>
                <Badge variant="success" className="text-[9px] py-0 px-1.5">Active</Badge>
              </div>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Bio-Analytics Bay • 5 Gear Units</p>
              <p className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Dr. S. Nair</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">Physics & Optics</span>
                <Badge variant="success" className="text-[9px] py-0 px-1.5">Active</Badge>
              </div>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">Photonics Annex • 4 Gear Units</p>
              <p className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">Dr. H. Tanaka</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
