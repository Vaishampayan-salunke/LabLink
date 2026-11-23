import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Equipment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Cpu,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  CalendarCheck,
  Layers,
  Wrench,
  AlertTriangle,
} from "lucide-react";

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  // Slot availability check state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [checkDate, setCheckDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchEquipment = async () => {
      try {
        const data = await api.getEquipmentDetail(id);
        setEquipment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleCheckAvailability = async () => {
    if (!id) return;
    setCheckingConflict(true);
    setConflictResult(null);

    const start = new Date(`${checkDate}T${startTime}:00Z`).toISOString();
    const end = new Date(`${checkDate}T${endTime}:00Z`).toISOString();

    try {
      const result = await api.getSchedulingRecommendations({
        equipment_id: id,
        start_time: start,
        end_time: end,
      });
      setConflictResult(result);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCheckingConflict(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading equipment specifications...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">Equipment not found.</p>
        <Button onClick={() => navigate("/student/equipment")} className="mt-4 text-xs">
          Back to Catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/student/equipment")}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#68758B] dark:text-[#A0ABC0] hover:text-[#5945E8] dark:hover:text-[#7968FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Equipment Catalogue</span>
      </button>

      {/* Main Overview Banner */}
      <Card className="p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80 h-64 rounded-xl bg-[#080D19] overflow-hidden relative shrink-0">
          {equipment.image_url ? (
            <img
              src={equipment.image_url}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#7968FF]">
              <Cpu className="w-16 h-16 opacity-40" />
            </div>
          )}
          <Badge
            variant={equipment.status === "AVAILABLE" ? "success" : "destructive"}
            className="absolute top-3 right-3 backdrop-blur-md"
          >
            {equipment.status}
          </Badge>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="default" className="text-xs font-semibold">
                {equipment.category}
              </Badge>
              {equipment.is_restricted ? (
                <Badge variant="warning" className="text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Restricted (Faculty Approval Required)</span>
                </Badge>
              ) : (
                <Badge variant="success" className="text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant Confirmation Eligible</span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] dark:text-[#F1F3FA] tracking-tight">
              {equipment.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#68758B] dark:text-[#A0ABC0] mt-2">
              <MapPin className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>
                {equipment.department_name} • {equipment.laboratory_name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#68758B] dark:text-[#A0ABC0] mt-3 leading-relaxed">
              {equipment.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#1F2C4A] flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6 text-xs text-[#68758B] dark:text-[#A0ABC0]">
              <div>
                <span className="block text-[11px]">Model No:</span>
                <span className="font-semibold text-[#172033] dark:text-[#F1F3FA]">{equipment.model_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px]">Total Units:</span>
                <span className="font-semibold text-[#172033] dark:text-[#F1F3FA] tabular-nums">{equipment.total_quantity}</span>
              </div>
              <div>
                <span className="block text-[11px]">Available Units:</span>
                <span className="font-semibold text-[#0DAA78] dark:text-[#21C997] tabular-nums">{equipment.available_quantity}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/student/booking/new?equipment_id=${equipment.id}`)}
              className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs px-6 shadow-md shadow-[#5945E8]/20"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              Proceed to Reserve Slot
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specifications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>Technical Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.specifications && equipment.specifications.length > 0 ? (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
                {equipment.specifications.map((s) => (
                  <div key={s.id} className="py-2.5 flex justify-between text-xs">
                    <span className="font-medium text-[#68758B] dark:text-[#A0ABC0]">{s.spec_name}</span>
                    <span className="font-bold text-[#172033] dark:text-[#F1F3FA] text-right">{s.spec_value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] py-4 text-center">No additional specifications registered.</p>
            )}

            <div className="mt-4 p-3.5 rounded-xl bg-[#EEF0FA] dark:bg-[#1C2642] border border-[#5945E8]/20 text-xs text-[#5945E8] dark:text-[#A394FF]">
              <span className="font-semibold">Access Policy: </span>
              Maximum allowed continuous session:{" "}
              <span className="font-bold">{equipment.access_policy?.max_booking_hours || 4} hours</span>.
              Booking is open to verified student researchers and laboratory fellows.
            </div>
          </CardContent>
        </Card>

        {/* Live Slot Conflict Prober */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
              <span>Check Slot Availability & Scheduling Intelligence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] mb-1">Target Date</label>
                <Input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] mb-1">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#68758B] dark:text-[#A0ABC0] mb-1">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <Button
              onClick={handleCheckAvailability}
              disabled={checkingConflict}
              className="w-full text-xs h-9 bg-[#5945E8] hover:bg-[#4D39D9]"
            >
              {checkingConflict ? "Analyzing schedule..." : "Probe Slot Feasibility"}
            </Button>

            {/* Results preview */}
            {conflictResult && (
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-[#F6F7FB]/70 dark:bg-[#10182B]/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {conflictResult.has_conflict ? (
                    <>
                      <XCircle className="w-4 h-4 text-[#E34E62]" />
                      <span className="text-[#E34E62] dark:text-[#F16B7B]">Scheduling Conflict Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0DAA78]" />
                      <span className="text-[#0DAA78] dark:text-[#21C997]">Target Slot is 100% Free & Available</span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                  {conflictResult.conflict_reason || "No overlapping bookings found. Ready for instant reservation submission."}
                </p>

                {conflictResult.alternative_slots && conflictResult.alternative_slots.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A]">
                    <span className="text-[10px] uppercase font-bold text-[#5945E8] dark:text-[#A394FF] block mb-1">
                      Recommended Alternative Slots:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {conflictResult.alternative_slots.slice(0, 3).map((alt: any, idx: number) => (
                        <Badge key={idx} variant="default" className="text-[10px]">
                          {new Date(alt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(alt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
