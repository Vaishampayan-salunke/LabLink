import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Search, Clock, MapPin, User } from "lucide-react";

export const AdminBookingsPage: React.FC = () => {
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
          Institution-Wide Reservations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete ledger of student and faculty reservations, approvals, and usage states across all departments.
        </p>
      </div>

      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading bookings ledger...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Department / Lab</th>
                    <th className="px-5 py-3">Time Slot</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{b.equipment_name}</span>
                        <span className="text-[10px] text-slate-400">{b.equipment_category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 block">{b.student_name}</span>
                        <span className="text-[10px] text-slate-400">{b.student_email}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span>{b.department_name}</span>
                        <span className="text-[10px] text-slate-400 block">{b.laboratory_name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 block">{formatDate(b.start_time)}</span>
                        <span className="text-[10px] text-slate-500">
                          to {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
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
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                        {b.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
