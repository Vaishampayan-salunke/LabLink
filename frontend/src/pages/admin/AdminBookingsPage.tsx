import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Clock, MapPin, User, Search } from "lucide-react";

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filtered = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.equipment_name && b.equipment_name.toLowerCase().includes(term)) ||
      (b.student_name && b.student_name.toLowerCase().includes(term)) ||
      (b.department_name && b.department_name.toLowerCase().includes(term)) ||
      (b.status && b.status.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Master Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Institution-Wide Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Complete institutional ledger of student and faculty reservations, approvals, and usage states across all departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold text-white border-white/20">
            {bookings.length} Total Records
          </Badge>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#68758B]" />
        <input
          type="text"
          placeholder="Search by equipment, student, department, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] text-xs text-[#172033] dark:text-[#F1F3FA] placeholder:text-[#68758B] focus:outline-none focus:ring-2 focus:ring-[#7968FF]"
        />
      </div>

      {/* Ledger Table */}
      <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading bookings ledger...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">
              No reservations found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172033] dark:text-[#F1F3FA]">
                <thead className="bg-[#F6F7FB] dark:bg-[#10182B] border-b border-[#E2E8F0] dark:border-[#1F2C4A] text-[#68758B] dark:text-[#A0ABC0] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Equipment</th>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Department / Lab</th>
                    <th className="px-5 py-3.5">Time Slot</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Stated Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F6F7FB] dark:hover:bg-[#1C2642]/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[#172033] dark:text-[#F1F3FA] block">{b.equipment_name}</span>
                        <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">{b.equipment_category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#172033] dark:text-[#F1F3FA] block">{b.student_name}</span>
                        <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">{b.student_email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[#172033] dark:text-[#F1F3FA] font-medium">{b.department_name}</span>
                        <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] block">{b.laboratory_name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#172033] dark:text-[#F1F3FA] block">{formatDate(b.start_time)}</span>
                        <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0]">
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
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-[#68758B] dark:text-[#A0ABC0]">
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
