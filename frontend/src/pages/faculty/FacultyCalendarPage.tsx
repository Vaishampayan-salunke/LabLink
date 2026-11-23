import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, User, Calendar } from "lucide-react";

export const FacultyCalendarPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getAllBookings();
        setBookings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Master Laboratory Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Booking Calendar & Timetable
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Chronological schedule of confirmed laboratory workstation reservations and active equipment sessions across departments.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-[#E2E8F0] dark:border-[#1F2C4A] pb-3">
          <CardTitle className="text-sm font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
            <span>Scheduled Laboratory Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading timetable...</div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">
              No sessions scheduled currently.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F7FB]/50 dark:hover:bg-[#10182B]/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#172033] dark:text-[#F1F3FA]">{b.equipment_name}</span>
                      <Badge
                        variant={
                          b.status === "CONFIRMED"
                            ? "success"
                            : b.status === "PENDING"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {b.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#68758B] dark:text-[#A0ABC0]">
                      <span className="flex items-center gap-1 font-semibold text-[#172033] dark:text-[#F1F3FA]">
                        <Clock className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                        {formatDate(b.start_time)} — {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#68758B] dark:text-[#A0ABC0]" />
                        {b.student_name}
                      </span>
                    </div>

                    <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] pt-0.5">{b.purpose}</p>
                  </div>

                  <div className="text-xs text-[#68758B] dark:text-[#A0ABC0] sm:text-right shrink-0">
                    <span className="font-medium text-[#172033] dark:text-[#F1F3FA] block">{b.department_name}</span>
                    <span className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">{b.laboratory_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
