import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Equipment, AlternativeSlot } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CalendarCheck,
  Calendar,
  Cpu,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const NewBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefilledEquipmentId = searchParams.get("equipment_id") || "";

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(prefilledEquipmentId);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [purpose, setPurpose] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Recommendations and conflicts
  const [conflictReport, setConflictReport] = useState<any>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const list = await api.getEquipment();
        setEquipmentList(list);
        if (prefilledEquipmentId) {
          const match = list.find((e) => e.id === prefilledEquipmentId);
          if (match) setSelectedEquipment(match);
        } else if (list.length > 0) {
          setSelectedEquipmentId(list[0].id);
          setSelectedEquipment(list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [prefilledEquipmentId]);

  useEffect(() => {
    if (selectedEquipmentId && equipmentList.length > 0) {
      const match = equipmentList.find((e) => e.id === selectedEquipmentId);
      setSelectedEquipment(match || null);
    }
  }, [selectedEquipmentId, equipmentList]);

  // Check conflicts whenever times or equipment change
  useEffect(() => {
    const probe = async () => {
      if (!selectedEquipmentId || !bookingDate || !startTime || !endTime) return;
      setCheckingConflict(true);
      setError(null);

      const startIso = new Date(`${bookingDate}T${startTime}:00Z`).toISOString();
      const endIso = new Date(`${bookingDate}T${endTime}:00Z`).toISOString();

      try {
        const rec = await api.getSchedulingRecommendations({
          equipment_id: selectedEquipmentId,
          start_time: startIso,
          end_time: endIso,
          deadline: projectDeadline ? new Date(projectDeadline).toISOString() : undefined,
        });
        setConflictReport(rec);
      } catch (err) {
        // ignore probe error
      } finally {
        setCheckingConflict(false);
      }
    };

    const timer = setTimeout(probe, 300);
    return () => clearTimeout(timer);
  }, [selectedEquipmentId, bookingDate, startTime, endTime, projectDeadline]);

  const handleApplyAlternative = (alt: AlternativeSlot) => {
    const sDate = new Date(alt.start_time);
    const eDate = new Date(alt.end_time);

    setBookingDate(sDate.toISOString().split("T")[0]);
    setStartTime(sDate.toTimeString().substring(0, 5));
    setEndTime(eDate.toTimeString().substring(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentId) {
      setError("Please select laboratory equipment");
      return;
    }
    setError(null);
    setSubmitting(true);

    const startIso = new Date(`${bookingDate}T${startTime}:00Z`).toISOString();
    const endIso = new Date(`${bookingDate}T${endTime}:00Z`).toISOString();

    try {
      await api.createBooking({
        equipment_id: selectedEquipmentId,
        start_time: startIso,
        end_time: endIso,
        purpose,
        project_title: projectTitle || undefined,
        project_description: projectDesc || undefined,
        project_deadline: projectDeadline ? new Date(projectDeadline).toISOString() : undefined,
      });

      navigate("/student/bookings");
    } catch (err: any) {
      setError(err.message || "Failed to create booking reservation. Please check slot conflicts.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Equipment Access Request</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Reserve Laboratory Equipment
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Submit project-based equipment access requests with real-time conflict detection and faculty approval routing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-[#E2E8F0] dark:border-[#1F2C4A]">
              <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">
                Reservation Details
              </CardTitle>
              <CardDescription className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
                Fill in your laboratory slot and project justification.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[#E34E62] dark:text-[#F16B7B] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Equipment Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1.5">
                    Select Equipment *
                  </label>
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-slate-50 dark:bg-[#10182B] text-xs text-[#172033] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#7968FF]"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id} className="bg-white dark:bg-[#151D30] text-[#172033] dark:text-white">
                        {eq.name} ({eq.department_name} - {eq.laboratory_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1.5">
                      Booking Date *
                    </label>
                    <Input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="text-xs h-10 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1.5">
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-xs h-10 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1.5">
                      End Time *
                    </label>
                    <Input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-xs h-10 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1.5">
                    Booking Purpose / Experiment Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your experimental objective..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-slate-50 dark:bg-[#10182B] text-xs text-[#172033] dark:text-white placeholder:text-[#68758B] focus:outline-none focus:ring-2 focus:ring-[#7968FF]"
                  />
                </div>

                {/* Project Details */}
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2C4A] space-y-3">
                  <p className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA]">
                    Project-Based Allocation Context (Optional)
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] mb-1">
                      Project Title
                    </label>
                    <Input
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Autonomous IoT Weather Station"
                      className="text-xs h-9 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] mb-1">
                        Project Deadline
                      </label>
                      <Input
                        type="date"
                        value={projectDeadline}
                        onChange={(e) => setProjectDeadline(e.target.value)}
                        className="text-xs h-9 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting || (conflictReport && !conflictReport.is_requested_slot_available)}
                  className="w-full bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold py-2.5 h-11 text-xs mt-3 shadow-md shadow-[#5945E8]/20"
                >
                  {submitting ? "Reserving Slot..." : "Submit Equipment Booking Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Info & Conflict Resolution Panel */}
        <div className="space-y-4">
          {/* Equipment Status Card */}
          {selectedEquipment && (
            <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {selectedEquipment.category}
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    Faculty Review Required
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-[#172033] dark:text-[#F1F3FA] text-sm">{selectedEquipment.name}</h4>
                  <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                    {selectedEquipment.department_name} • {selectedEquipment.laboratory_name}
                  </p>
                </div>

                <div className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A]">
                  <div className="flex justify-between">
                    <span>Allowed Max Duration:</span>
                    <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">
                      {selectedEquipment.access_policy?.max_booking_hours || 4} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Units:</span>
                    <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">
                      {selectedEquipment.available_quantity} available
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflict Analysis Indicator */}
          <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                <span>Deterministic Conflict Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkingConflict ? (
                <div className="py-4 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">
                  Checking schedule overlaps in database...
                </div>
              ) : conflictReport?.is_requested_slot_available ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#0DAA78] dark:text-[#21C997] text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0DAA78] dark:text-[#21C997]" />
                    <span>Slot is Completely Free</span>
                  </div>
                  <p className="text-[11px] text-[#0DAA78]/90 dark:text-[#21C997]/90">
                    No confirmed bookings or scheduled maintenance windows overlap.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[#E34E62] dark:text-[#F16B7B] text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <XCircle className="w-4 h-4 text-[#E34E62] dark:text-[#F16B7B]" />
                    <span>Schedule Conflict Detected</span>
                  </div>
                  <p className="text-[11px] text-[#E34E62]/90 dark:text-[#F16B7B]/90">
                    {conflictReport?.conflict_reason || "The selected time slot overlaps with an existing reservation."}
                  </p>
                </div>
              )}

              {/* Scored Alternative Slots */}
              {conflictReport?.alternative_slots && conflictReport.alternative_slots.length > 0 && (
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A]">
                  <p className="text-[11px] font-bold text-[#172033] dark:text-[#F1F3FA] mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#5945E8] dark:text-[#7968FF]" />
                    <span>Recommended Feasible Slots</span>
                  </p>

                  <div className="space-y-2">
                    {conflictReport.alternative_slots.slice(0, 3).map((alt: AlternativeSlot, idx: number) => {
                      const sDate = new Date(alt.start_time);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-slate-50 dark:bg-[#10182B] hover:bg-slate-100 dark:hover:bg-[#1C2642]/60 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">
                              {sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                              {sDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <Badge variant="default" className="text-[9px] py-0 px-1.5 font-bold">
                              Score: {alt.score}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] mb-2">{alt.explanation}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyAlternative(alt)}
                            className="w-full h-7 text-[10px] bg-white dark:bg-[#151D30] text-[#5945E8] dark:text-[#A394FF] border-[#E2E8F0] dark:border-[#1F2C4A] hover:bg-[#5945E8]/10"
                          >
                            Use This Slot
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
