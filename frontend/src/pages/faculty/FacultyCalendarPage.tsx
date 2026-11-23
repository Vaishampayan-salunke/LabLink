import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Laboratory Timetable & Booking Calendar
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological schedule of confirmed laboratory workstation reservations and active equipment sessions.
        </p>
      </div>

      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>Scheduled Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading timetable...</div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No sessions scheduled currently.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.equipment_name}</span>
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

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {formatDate(b.start_time)} — {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {b.student_name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 pt-0.5">{b.purpose}</p>
                  </div>

                  <div className="text-xs text-slate-500 sm:text-right shrink-0">
                    <span className="font-medium text-slate-700 block">{b.department_name}</span>
                    <span className="text-[11px] text-slate-400">{b.laboratory_name}</span>
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
