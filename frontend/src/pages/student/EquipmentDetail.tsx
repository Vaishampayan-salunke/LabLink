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
} from "lucide-react";

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick slot availability check state
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
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading equipment specifications...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-slate-800">Equipment not found.</p>
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
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Equipment Catalogue</span>
      </button>

      {/* Main Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80 h-64 rounded-xl bg-slate-900 overflow-hidden relative shrink-0">
          {equipment.image_url ? (
            <img
              src={equipment.image_url}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Cpu className="w-16 h-16" />
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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-semibold">
                {equipment.category}
              </Badge>
              {equipment.is_restricted ? (
                <Badge variant="warning" className="text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Restricted Access (Requires Approval)</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs text-emerald-700 bg-emerald-50">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Instant Confirmation Eligible
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {equipment.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>
                {equipment.department_name} • {equipment.laboratory_name}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {equipment.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block">Model No:</span>
                <span className="font-semibold text-slate-900">{equipment.model_number || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Units:</span>
                <span className="font-semibold text-slate-900">{equipment.total_quantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Available Units:</span>
                <span className="font-semibold text-slate-900">{equipment.available_quantity}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/student/booking/new?equipment_id=${equipment.id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 shadow-md shadow-indigo-600/20"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              Proceed to Reserve Slot
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specifications Table */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Technical Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.specifications && equipment.specifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {equipment.specifications.map((s) => (
                  <div key={s.id} className="py-2.5 flex justify-between text-xs">
                    <span className="font-medium text-slate-600">{s.spec_name}</span>
                    <span className="font-bold text-slate-900 text-right">{s.spec_value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No additional specifications registered.</p>
            )}

            <div className="mt-4 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900">
              <span className="font-semibold">Access Policy: </span>
              Maximum allowed continuous session:{" "}
              <span className="font-bold">{equipment.access_policy?.max_booking_hours || 4} hours</span>.
              Booking is open to enrolled students and registered researchers.
            </div>
          </CardContent>
        </Card>

        {/* Live Slot Conflict Prober */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Check Slot Availability & Conflicts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Date</label>
                <Input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time</label>
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
              variant="secondary"
              size="sm"
              className="w-full text-xs"
            >
              {checkingConflict ? "Querying Database..." : "Check Slot Availability"}
            </Button>

            {conflictResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  conflictResult.is_requested_slot_available
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {conflictResult.is_requested_slot_available ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Slot Available for Reservation</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Conflicting Reservation Detected</span>
                    </>
                  )}
                </div>

                {!conflictResult.is_requested_slot_available && (
                  <p className="text-[11px] text-rose-700 mt-1">
                    {conflictResult.conflict_reason || "This equipment is already occupied during this time."}
                  </p>
                )}

                {conflictResult.alternative_slots && conflictResult.alternative_slots.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-900 mb-1.5">
                      Intelligent Recommended Alternatives:
                    </p>
                    <div className="space-y-1.5">
                      {conflictResult.alternative_slots.slice(0, 2).map((alt: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">
                              {new Date(alt.start_time).toLocaleDateString()} {new Date(alt.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="block text-[10px] text-slate-500">{alt.explanation}</span>
                          </div>
                          <Badge variant="default" className="text-[10px]">
                            Score: {alt.score}
                          </Badge>
                        </div>
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
