import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  MapPin,
  Calendar,
  Ban,
  ArrowRight,
} from "lucide-react";

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFIRMED" | "PENDING" | "HISTORY">("ALL");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this equipment reservation?")) return;
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "CONFIRMED") return b.status === "CONFIRMED";
    if (activeTab === "PENDING") return b.status === "PENDING";
    if (activeTab === "HISTORY")
      return ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status);
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Laboratory Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track confirmed laboratory slots, faculty access approvals, and past borrowing history.
          </p>
        </div>

        <Button
          onClick={() => navigate("/student/booking/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        {(["ALL", "CONFIRMED", "PENDING", "HISTORY"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.toLowerCase()} Bookings
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading your equipment reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm bg-white text-center py-16">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No bookings in this category</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            You don't have any bookings matching the current filter.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/student/equipment")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-xs"
          >
            Discover Equipment
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((b) => (
            <Card
              key={b.id}
              className="border-slate-200/80 shadow-sm bg-white hover:border-slate-300 transition-all"
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{b.equipment_name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {b.equipment_category}
                    </Badge>
                    <Badge
                      variant={
                        b.status === "CONFIRMED"
                          ? "success"
                          : b.status === "PENDING"
                          ? "warning"
                          : b.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {b.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {formatDate(b.start_time)} — {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.department_name} ({b.laboratory_name})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">Purpose: </span>
                    {b.purpose}
                  </p>

                  {b.project_title && (
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold">Project: </span>
                      {b.project_title}
                    </p>
                  )}

                  {b.rejection_reason && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs mt-2">
                      <span className="font-semibold">Rejection reason: </span>
                      {b.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {["PENDING", "CONFIRMED"].includes(b.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-8"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {cancellingId === b.id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
