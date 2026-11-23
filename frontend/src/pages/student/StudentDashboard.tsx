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
  FolderOpen,
  QrCode,
  TrendingUp,
  ChevronRight,
  Check,
} from "lucide-react";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, projs] = await Promise.all([
          api.getStudentAnalytics(),
          api.getProjects().catch(() => []),
        ]);
        setAnalytics(stats);
        setProjects(projs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "Researcher";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#5945E8] to-[#8170F5] dark:from-[#151D30] dark:to-[#1B253D] border border-transparent dark:border-[#1F2C4A] text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-[#7968FF]/20 text-white dark:text-[#A394FF] text-xs font-semibold backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#21C997] animate-pulse"></span>
            Academic Session Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-indigo-100 dark:text-[#A0ABC0] max-w-xl">
            Your laboratory workspace is ready. You have {analytics?.upcoming_bookings ?? 0} upcoming confirmed session{analytics?.upcoming_bookings !== 1 ? "s" : ""} and {analytics?.pending_approvals ?? 0} pending review{analytics?.pending_approvals !== 1 ? "s" : ""}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate("/student/equipment")}
            className="bg-white text-[#5945E8] hover:bg-slate-50 dark:bg-[#7968FF] dark:text-white dark:hover:bg-[#6c57ff] font-semibold text-xs shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            Explore Equipment
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/student/assistant")}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 dark:border-[#243252] dark:bg-[#151D30] font-semibold text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-200 dark:text-[#A394FF]" />
            Ask Gemini AI
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] mt-1 tabular-nums">
                {analytics?.total_bookings ?? 0}
              </p>
              <p className="text-[11px] text-[#0DAA78] dark:text-[#21C997] font-medium mt-0.5">
                Lifetime reservations
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Upcoming Sessions
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#5945E8] dark:text-[#7968FF] mt-1 tabular-nums">
                {analytics?.upcoming_bookings ?? 0}
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                Next: Tomorrow 11:00 AM
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Pending Approvals
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#E99A27] dark:text-[#F4B544] mt-1 tabular-nums">
                {analytics?.pending_approvals ?? 0}
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                Awaiting faculty review
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FEF5E9] dark:bg-[#382408] text-[#E99A27] dark:text-[#F4B544] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] uppercase tracking-wider">
                Active Projects
              </p>
              <p className="text-2xl font-heading font-extrabold text-[#0DAA78] dark:text-[#21C997] mt-1 tabular-nums">
                {projects.length || 1}
              </p>
              <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] font-medium mt-0.5">
                {projects.length > 0 ? "Collaborative research" : "1 active study"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2-Column Left Area: Upcoming & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Upcoming Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                  <span>Upcoming Equipment Bookings</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                  Confirmed laboratory slots with QR gatepass access
                </p>
              </div>
              <Link
                to="/student/bookings"
                className="text-xs font-semibold text-[#5945E8] dark:text-[#7968FF] hover:underline flex items-center gap-1"
              >
                <span>All Reservations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-[#68758B]">Checking database reservations...</div>
              ) : !analytics?.recent_activity?.length ? (
                <div className="py-10 text-center">
                  <Cpu className="w-10 h-10 text-[#68758B]/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">No upcoming slots</p>
                  <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
                    Reserve lab instrumentation for your ongoing engineering projects.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/student/equipment")}
                    className="mt-4"
                  >
                    Browse Equipment Catalogue
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.recent_activity.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#5945E8]/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-[#172033] dark:text-[#F1F3FA]">
                            {item.equipment_name}
                          </span>
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
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#68758B] dark:text-[#A0ABC0]">
                          <span className="flex items-center gap-1 font-medium text-[#172033] dark:text-[#F1F3FA]">
                            <Clock className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                            {formatDate(item.start_time)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-sm">{item.purpose}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {item.status === "CONFIRMED" && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] text-xs font-semibold">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Pass Ready</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/student/bookings")}
                          className="h-8 text-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section B: My Active Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                  <span>My Active Research Projects</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                  Track project hardware allocation and milestones
                </p>
              </div>
              <Link
                to="/student/projects"
                className="text-xs font-semibold text-[#5945E8] dark:text-[#7968FF] hover:underline flex items-center gap-1"
              >
                <span>Manage Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#1F2C4A] text-center">
                  <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">No projects created yet.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/student/projects")}
                    className="mt-2 text-xs"
                  >
                    + Create Project Workspace
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {projects.slice(0, 2).map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-heading font-bold text-sm text-[#172033] dark:text-[#F1F3FA]">
                            {proj.title}
                          </h4>
                          <span className="text-[11px] text-[#5945E8] dark:text-[#7968FF] font-medium">
                            {proj.domain}
                          </span>
                        </div>
                        <Badge variant="success" className="text-[10px]">
                          {proj.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] line-clamp-2">
                        {proj.description}
                      </p>

                      <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A] flex items-center justify-between text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                        <span>Collaborators: {proj.members?.length || 1}</span>
                        <span className="text-[#0DAA78] dark:text-[#21C997] font-semibold">Active Gear Bound</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1-Column Area: AI Recommendations & Recent Activity */}
        <div className="space-y-6">
          {/* Section C: Gemini AI Recommendation Card */}
          <Card className="border-[#5945E8]/30 dark:border-[#7968FF]/30 bg-gradient-to-br from-white to-[#EEF0FA]/50 dark:from-[#151D30] dark:to-[#1B253D]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5945E8] dark:text-[#A394FF] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommended Gear</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5945E8]/10 text-[#5945E8] dark:text-[#A394FF] font-semibold">
                  Gemini 2.5
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] mt-1">
                Matched for Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                    ESP32-S3 Dual-Core AIoT Dev Kit
                  </span>
                  <Badge variant="success" className="text-[9px]">98% Match</Badge>
                </div>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  Matches wireless telemetry & low-power sleep profiling requirements.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">
                    Available Today
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate("/student/equipment")}
                    className="h-7 text-[11px] px-2.5 bg-[#5945E8] hover:bg-[#4D39D9]"
                  >
                    Reserve Slot
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                    16-Channel Logic Analyser
                  </span>
                  <Badge variant="default" className="text-[9px]">92% Match</Badge>
                </div>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  High sample rate SPI/I2C packet capture for sensor bus debugging.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#0DAA78] dark:text-[#21C997] font-semibold">
                    Free in ECE Lab
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/student/equipment")}
                    className="h-7 text-[11px] px-2.5"
                  >
                    View Specs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section D: Recent Operational Updates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Laboratory Access Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">Faculty Review Active</p>
                    <p className="text-[#68758B] dark:text-[#A0ABC0] text-[11px]">
                      Prof. Rostova approved your ESP32 test bench access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#EEF0FA] dark:bg-[#1C2642] text-[#5945E8] dark:text-[#A394FF] flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">Digital QR Gatepass Active</p>
                    <p className="text-[#68758B] dark:text-[#A0ABC0] text-[11px]">
                      Present pass to lab assistant at Edison Hall ECE-302.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FEF5E9] dark:bg-[#382408] text-[#E99A27] dark:text-[#F4B544] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#172033] dark:text-[#F1F3FA]">FPGA Session Pending</p>
                    <p className="text-[#68758B] dark:text-[#A0ABC0] text-[11px]">
                      High-demand reconfigurable logic slot queued for verification.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Reserve Popular Campus Instrumentation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Quick Reserve • High-Demand Campus Instrumentation</span>
              </CardTitle>
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                Fast-track 1-click reservations for verified student project workstations
              </p>
            </div>
            <Link
              to="/student/equipment"
              className="text-xs font-semibold text-[#5945E8] dark:text-[#7968FF] hover:underline flex items-center gap-1"
            >
              <span>Explore All 28 Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2 hover:border-[#5945E8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[9px]">Available</Badge>
                  <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">ECE Dept</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-[#172033] dark:text-[#F1F3FA] mt-1.5">
                  Xilinx Artix-7 FPGA Board
                </h4>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] line-clamp-2 mt-0.5">
                  100K logic cells, dual PMOD connectors, Vivado lab station.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/student/equipment")}
                className="w-full text-xs h-7 mt-2 bg-[#5945E8] hover:bg-[#4D39D9]"
              >
                Reserve Slot
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2 hover:border-[#5945E8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[9px]">Available</Badge>
                  <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">CSE Dept</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-[#172033] dark:text-[#F1F3FA] mt-1.5">
                  NVIDIA Jetson Orin Nano
                </h4>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] line-clamp-2 mt-0.5">
                  40 TOPS AI inference, TensorRT pre-configured, CSI cameras.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/student/equipment")}
                className="w-full text-xs h-7 mt-2 bg-[#5945E8] hover:bg-[#4D39D9]"
              >
                Reserve Slot
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2 hover:border-[#5945E8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[9px]">Available</Badge>
                  <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">Robotics Lab</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-[#172033] dark:text-[#F1F3FA] mt-1.5">
                  Universal Robots UR5e Arm
                </h4>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] line-clamp-2 mt-0.5">
                  6-DOF collaborative robotic arm with ROS2 Humble bridge.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/student/equipment")}
                className="w-full text-xs h-7 mt-2 bg-[#5945E8] hover:bg-[#4D39D9]"
              >
                Reserve Slot
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/50 dark:bg-[#10182B]/40 space-y-2 hover:border-[#5945E8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[9px]">Available</Badge>
                  <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">Physics Lab</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-[#172033] dark:text-[#F1F3FA] mt-1.5">
                  Rohde & Schwarz 1GHz Scope
                </h4>
                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] line-clamp-2 mt-0.5">
                  4 analog channels, 5 GSa/s, deep 200 Mpts waveform memory.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/student/equipment")}
                className="w-full text-xs h-7 mt-2 bg-[#5945E8] hover:bg-[#4D39D9]"
              >
                Reserve Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
