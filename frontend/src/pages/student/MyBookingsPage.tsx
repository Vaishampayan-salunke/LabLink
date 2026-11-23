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
  QrCode,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Active Reservations & Passes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            My Laboratory Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Track confirmed laboratory slots, faculty access decisions, and digital QR check-in gatepasses.
          </p>
        </div>

        <Button
          onClick={() => navigate("/student/booking/new")}
          className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20"
        >
          <CalendarCheck className="w-4 h-4 mr-1.5" />
          New Reservation
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#1F2C4A] gap-6 text-xs font-semibold">
        {(["ALL", "CONFIRMED", "PENDING", "HISTORY"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? "text-[#5945E8] dark:text-[#7968FF] border-b-2 border-[#5945E8] dark:border-[#7968FF]"
                : "text-[#68758B] dark:text-[#A0ABC0] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
            }`}
          >
            {tab.toLowerCase()} Bookings ({
              tab === "ALL" ? bookings.length :
              tab === "CONFIRMED" ? bookings.filter(b => b.status === "CONFIRMED").length :
              tab === "PENDING" ? bookings.filter(b => b.status === "PENDING").length :
              bookings.filter(b => ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status)).length
            })
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] font-medium">Loading your equipment reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="w-12 h-12 text-[#68758B]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">No bookings in this category</h3>
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1 max-w-xs mx-auto">
            You don't have any bookings matching the current filter.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/student/equipment")}
            className="mt-4 text-xs bg-[#5945E8] hover:bg-[#4D39D9]"
          >
            Discover Equipment
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((b) => (
            <Card
              key={b.id}
              className="hover:border-[#5945E8]/30 dark:hover:border-[#7968FF]/30 transition-all"
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm sm:text-base text-[#172033] dark:text-[#F1F3FA]">
                      {b.equipment_name}
                    </span>
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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#68758B] dark:text-[#A0ABC0]">
                    <span className="flex items-center gap-1 font-medium text-[#172033] dark:text-[#F1F3FA]">
                      <Clock className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                      {formatDate(b.start_time)} — {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-sm">Purpose: {b.purpose}</span>
                  </div>

                  {b.rejection_reason && (
                    <p className="text-xs text-[#E34E62] dark:text-[#F16B7B] font-medium bg-[#FDECEF] dark:bg-[#3B151F] px-3 py-1.5 rounded-lg inline-block">
                      Rejection Reason: {b.rejection_reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  {b.status === "CONFIRMED" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F8F3] dark:bg-[#0B3326] text-[#0DAA78] dark:text-[#21C997] text-xs font-semibold">
                      <QrCode className="w-4 h-4" />
                      <span>QR Gatepass Active</span>
                    </div>
                  )}

                  {["CONFIRMED", "PENDING"].includes(b.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="text-xs h-8"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {cancellingId === b.id ? "Cancelling..." : "Cancel"}
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
