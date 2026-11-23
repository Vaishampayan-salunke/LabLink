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
  Wrench,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  CalendarDays,
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
        setPendingApprovals(pending || []);
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
      {/* Top Banner / Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Faculty Laboratory Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Department Laboratory Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Review incoming student research reservations, monitor departmental resource utilization, and manage scheduled equipment calibrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate("/faculty/approvals")}
            className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/25"
          >
            <FileCheck2 className="w-4 h-4 mr-1.5" />
            Review Queue ({pendingApprovals.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/faculty/equipment")}
            className="border-[#233152] bg-[#151D30] text-white hover:bg-[#1E2943] text-xs"
          >
            <Wrench className="w-4 h-4 mr-1.5 text-[#A394FF]" />
            Equipment & Maintenance
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#E99A27]/40 dark:hover:border-[#F4B544]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Pending Approvals
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#E99A27] dark:text-[#F4B544] mt-1 tabular-nums">
                {analytics?.pending_approvals_count ?? pendingApprovals.length}
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                Requires faculty review
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FEF5E9] dark:bg-[#382408] text-[#E99A27] dark:text-[#F4B544] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Department Gear
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-1 tabular-nums">
                {analytics?.department_equipment_count ?? 28}
              </p>
              <p className="text-[11px] text-[#0DAA78] dark:text-[#21C997] font-medium mt-0.5">
                Active catalog units
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#0DAA78]/40 dark:hover:border-[#21C997]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Active Bookings
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#0DAA78] dark:text-[#21C997] mt-1 tabular-nums">
                {analytics?.active_bookings_count ?? 4}
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                Currently checked in
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Utilisation Rate
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#5945E8] dark:text-[#7968FF] mt-1 tabular-nums">
                {analytics?.utilization_rate ?? 76}%
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                High lab efficiency
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Column: Awaiting Faculty Decision Review Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#E99A27] dark:text-[#F4B544]" />
                  <span>Awaiting Your Faculty Decision</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                  Student project reservations pending mandatory faculty verification
                </p>
              </div>
              <Link
                to="/faculty/approvals"
                className="text-xs font-semibold text-[#5945E8] dark:text-[#7968FF] hover:underline flex items-center gap-1"
              >
                <span>Approvals Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-[#68758B]">Loading pending requests...</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle className="w-10 h-10 text-[#0DAA78]/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">All requests reviewed</p>
                  <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
                    There are no unreviewed equipment reservations awaiting your decision right now.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#5945E8]/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-[#172033] dark:text-[#F1F3FA]">
                            {item.equipment_name}
                          </span>
                          <Badge variant="warning" className="text-[10px]">
                            Pending Review
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#68758B] dark:text-[#A0ABC0]">
                          <span className="font-semibold text-[#172033] dark:text-[#F1F3FA]">
                            {item.student_name}
                          </span>
                          <span>({item.student_email})</span>
                          <span>•</span>
                          <span>{formatDate(item.start_time)}</span>
                        </div>
                        <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
                          <span className="font-semibold text-[#172033] dark:text-[#F1F3FA]">Purpose: </span>
                          {item.purpose}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <Button
                          size="sm"
                          onClick={() => navigate("/faculty/approvals")}
                          className="bg-[#5945E8] hover:bg-[#4D39D9] text-xs h-8"
                        >
                          Review Request
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Booking Timetable Quick Access */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                  <span>Today's Laboratory Schedule</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                  Real-time occupancy across department workstations
                </p>
              </div>
              <Link
                to="/faculty/calendar"
                className="text-xs font-semibold text-[#5945E8] dark:text-[#7968FF] hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/40 dark:bg-[#10182B]/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                      ESP32-S3 Dual-Core AIoT Dev Kit
                    </p>
                    <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                      Edison Hall ECE-302 • Alex Rivera (Firmware profiling)
                    </p>
                  </div>
                  <Badge variant="success" className="text-[10px]">11:00 AM – 02:00 PM</Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/40 dark:bg-[#10182B]/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                      16-Channel Logic Analyser (500 MSps)
                    </p>
                    <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                      Edison Hall ECE-302 • Sensor bus test session
                    </p>
                  </div>
                  <Badge variant="default" className="text-[10px]">02:30 PM – 05:30 PM</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1-Column: Equipment Maintenance & Health Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Equipment Health & Maintenance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl border border-[#E99A27]/30 bg-[#FEF5E9]/40 dark:bg-[#382408]/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                    Siemens S7-1200 PLC Rig
                  </span>
                  <Badge variant="warning" className="text-[10px]">Maintenance</Badge>
                </div>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Scheduled relay contact calibration and firmware security patch.
                </p>
                <div className="pt-1 text-[10px] text-[#E99A27] dark:text-[#F4B544] font-semibold">
                  Field technician on site
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/40 dark:bg-[#10182B]/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                    Nexys A7-100T FPGA Board
                  </span>
                  <Badge variant="success" className="text-[10px]">Calibrated</Badge>
                </div>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Hardware synthesis tests passed. Ready for student deployment.
                </p>
                <div className="pt-1 text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">
                  Health score: 98/100
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate("/faculty/equipment")}
                className="w-full text-xs h-9 mt-2"
              >
                Schedule Equipment Service
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Department Usage Insight</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>ECE IoT Test Benches</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1F2C4A] rounded-full h-2">
                    <div className="bg-[#5945E8] dark:bg-[#7968FF] h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>VLSI FPGA Workstations</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1F2C4A] rounded-full h-2">
                    <div className="bg-[#8170F5] dark:bg-[#A394FF] h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Soldering & Rework Desks</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-[#1F2C4A] rounded-full h-2">
                    <div className="bg-[#0DAA78] dark:bg-[#21C997] h-2 rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Faculty Lab Operations & Quick Control Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Department Operational Controls & Safety Protocols</span>
              </CardTitle>
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                Faculty supervisory commands for scheduled sessions, safety checks, and emergency maintenance
              </p>
            </div>
            <Badge variant="success" className="text-xs font-semibold px-2.5 py-1">
              Active Supervision Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA] block">
                  Mandatory Lab Training
                </span>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  High-voltage and cleanroom safety prerequisite checklist for students.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/faculty/equipment")}
                className="w-full text-xs h-7 mt-2"
              >
                Inspect Protocols
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA] block">
                  Blackout Maintenance
                </span>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Block booking slots during university exam week or service dates.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/faculty/calendar")}
                className="w-full text-xs h-7 mt-2"
              >
                Set Blackout Dates
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA] block">
                  Faculty Approval Policy
                </span>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Automatic verification threshold configured for standard 2-hour slots.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/faculty/approvals")}
                className="w-full text-xs h-7 mt-2"
              >
                Adjust Thresholds
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA] block">
                  Equipment Inventory Audit
                </span>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Export department asset register with barcode and calibration serials.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/faculty/equipment")}
                className="w-full text-xs h-7 mt-2 bg-[#5945E8] hover:bg-[#4D39D9]"
              >
                View 10 Units
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
