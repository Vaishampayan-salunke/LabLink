import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Equipment, AlternativeSlot } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CalendarCheck,
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
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Reserve Laboratory Equipment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit project-based equipment access with deterministic conflict detection and faculty approval workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                Reservation Details
              </CardTitle>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Equipment Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Equipment
                  </label>
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.department_name} - {eq.laboratory_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Booking Date
                    </label>
                    <Input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="text-xs h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-xs h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-xs h-10"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Booking Purpose / Experiment Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your experimental objective..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Project Details */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-900">
                    Project-Based Allocation Context (Optional)
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project Title
                    </label>
                    <Input
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Autonomous IoT Weather Station"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project Deadline
                      </label>
                      <Input
                        type="date"
                        value={projectDeadline}
                        onChange={(e) => setProjectDeadline(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting || (conflictReport && !conflictReport.is_requested_slot_available)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 h-11 text-xs mt-2"
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
            <Card className="border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {selectedEquipment.category}
                  </Badge>
                  {selectedEquipment.is_restricted ? (
                    <Badge variant="warning" className="text-[10px]">
                      Restricted
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px]">
                      Auto-Approve
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedEquipment.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedEquipment.department_name} • {selectedEquipment.laboratory_name}
                  </p>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allowed Max Duration:</span>
                    <span className="font-bold text-slate-800">
                      {selectedEquipment.access_policy?.max_booking_hours || 4} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Units:</span>
                    <span className="font-bold text-slate-800">
                      {selectedEquipment.available_quantity} available
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflict Analysis Indicator */}
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deterministic Conflict Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkingConflict ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Checking schedule overlaps in database...
                </div>
              ) : conflictReport?.is_requested_slot_available ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Slot is Completely Free</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    No confirmed bookings or scheduled maintenance windows overlap.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Schedule Conflict Detected</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    {conflictReport?.conflict_reason || "The selected time slot overlaps with an existing reservation."}
                  </p>
                </div>
              )}

              {/* Scored Alternative Slots */}
              {conflictReport?.alternative_slots && conflictReport.alternative_slots.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-900 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Recommended Feasible Slots</span>
                  </p>

                  <div className="space-y-2">
                    {conflictReport.alternative_slots.slice(0, 3).map((alt: AlternativeSlot, idx: number) => {
                      const sDate = new Date(alt.start_time);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">
                              {sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                              {sDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <Badge variant="default" className="text-[9px] py-0 px-1.5 font-bold">
                              Score: {alt.score}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">{alt.explanation}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyAlternative(alt)}
                            className="w-full h-7 text-[10px] bg-white text-indigo-700 hover:bg-indigo-50"
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
