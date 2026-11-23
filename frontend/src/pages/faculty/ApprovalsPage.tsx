import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Layers,
  Calendar,
} from "lucide-react";

export const ApprovalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [pendingList, setPendingList] = useState<Booking[]>([]);
  const [historyList, setHistoryList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Reject modal state
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const data = await api.getPendingApprovals();
      setPendingList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.getFacultyHistory();
      setHistoryList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchPending(), fetchHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleApprove = async (booking: Booking) => {
    setActionInProgress(booking.id);
    try {
      await api.approveBooking(booking.id, "Approved by department faculty coordinator.");
      await refreshAll();
    } catch (err: any) {
      alert(err.message || "Failed to approve booking. Possible concurrent conflict.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    if (!rejectionReason.trim()) {
      setRejectError("Please provide an explicit reason for rejecting this booking request.");
      return;
    }
    setActionInProgress(rejectingBooking.id);
    setRejectError(null);

    try {
      await api.rejectBooking(rejectingBooking.id, rejectionReason);
      setRejectingBooking(null);
      setRejectionReason("");
      await refreshAll();
    } catch (err: any) {
      setRejectError(err.message || "Failed to reject booking.");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E99A27]/20 text-[#F4B544] text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-[#F4B544]" />
            <span>Faculty Review Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Faculty Approvals Console
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Review student project justifications and authorize laboratory equipment reservations across academic departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning" className="px-3 py-1.5 text-xs font-semibold">
            {pendingList.length} Pending Review{pendingList.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#1F2C4A] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "text-[#5945E8] dark:text-[#7968FF] border-b-2 border-[#5945E8] dark:border-[#7968FF]"
              : "text-[#68758B] dark:text-[#A0ABC0] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Pending Reviews ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "HISTORY"
              ? "text-[#5945E8] dark:text-[#7968FF] border-b-2 border-[#5945E8] dark:border-[#7968FF]"
              : "text-[#68758B] dark:text-[#A0ABC0] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
          }`}
        >
          <History className="w-4 h-4" />
          Approval History & Logs ({historyList.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Retrieving requests...</p>
        </div>
      ) : activeTab === "PENDING" ? (
        pendingList.length === 0 ? (
          <Card className="text-center py-16 border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-[#0DAA78] dark:text-[#21C997] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">All caught up!</h3>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
              There are currently no pending equipment booking requests requiring your review.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingList.map((b) => (
              <Card
                key={b.id}
                className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] hover:border-[#5945E8]/30 dark:hover:border-[#7968FF]/30 transition-all rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Project & Student Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-base text-[#172033] dark:text-[#F1F3FA]">{b.equipment_name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {b.equipment_category}
                        </Badge>
                        <Badge variant="warning" className="text-[10px]">
                          Awaiting Faculty Approval
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F6F7FB] dark:bg-[#10182B] p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A]">
                        <div>
                          <span className="text-[#68758B] dark:text-[#A0ABC0] block text-[10px] uppercase font-semibold">Student Name:</span>
                          <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">{b.student_name}</span>
                          <span className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] block">{b.student_email}</span>
                        </div>
                        <div>
                          <span className="text-[#68758B] dark:text-[#A0ABC0] block text-[10px] uppercase font-semibold">Requested Slot:</span>
                          <span className="font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#5945E8] dark:text-[#7968FF]" />
                            {formatDate(b.start_time)}
                          </span>
                          <span className="text-[11px] text-[#68758B] dark:text-[#A0ABC0]">
                            to {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {b.project_title && (
                          <p className="text-xs">
                            <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">Project: </span>
                            <span className="text-[#5945E8] dark:text-[#7968FF] font-semibold">{b.project_title}</span>
                          </p>
                        )}
                        <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] leading-relaxed">
                          <span className="font-bold text-[#172033] dark:text-[#F1F3FA]">Stated Objective: </span>
                          {b.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col gap-2 shrink-0 self-end lg:self-center">
                      <Button
                        onClick={() => handleApprove(b)}
                        disabled={actionInProgress === b.id}
                        className="bg-[#0DAA78] hover:bg-[#0c966a] text-white font-semibold text-xs h-9 px-4 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Approve Access
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setRejectingBooking(b);
                          setRejectionReason("");
                          setRejectError(null);
                        }}
                        disabled={actionInProgress === b.id}
                        className="border-[#E34E62]/30 text-[#E34E62] hover:bg-[#E34E62]/10 text-xs h-9 px-4"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject with Reason
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* History & Logs Tab */
        historyList.length === 0 ? (
          <Card className="text-center py-16 border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] rounded-2xl">
            <History className="w-12 h-12 text-[#68758B]/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">No history recorded yet</h3>
            <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
              Reviewed and historical booking decisions will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {historyList.map((b) => (
              <Card
                key={b.id}
                className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] rounded-2xl"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-sm text-[#172033] dark:text-[#F1F3FA]">
                        {b.equipment_name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {b.department_name}
                      </Badge>
                      <Badge
                        variant={
                          b.status === "CONFIRMED"
                            ? "success"
                            : b.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
                      Student: <strong className="text-[#172033] dark:text-[#F1F3FA]">{b.student_name}</strong> ({b.student_email})
                    </p>
                    <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#5945E8] dark:text-[#7968FF]" />
                      Slot: {formatDate(b.start_time)} to {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {b.rejection_reason && (
                      <p className="text-xs text-[#E34E62] dark:text-[#F16B7B] mt-1">
                        Reason: {b.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] block">
                      Ref ID: #{b.id.slice(0, 8)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Reject Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">
                Reject Access Request
              </CardTitle>
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">
                Provide a reason for student {rejectingBooking.student_name}. This will be permanently recorded and sent via notification.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {rejectError && (
                <div className="p-2.5 rounded-xl bg-[#E34E62]/10 border border-[#E34E62]/30 text-[#E34E62] text-xs">
                  {rejectError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Inadequate prerequisite safety training, conflicting department lab session, or excessive duration..."
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] bg-slate-50 dark:bg-[#10182B] text-xs text-[#172033] dark:text-[#F1F3FA] focus:outline-none focus:ring-2 focus:ring-[#E34E62]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingBooking(null)}
                  className="text-xs border-[#E2E8F0] dark:border-[#1F2C4A]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmReject}
                  disabled={actionInProgress === rejectingBooking.id}
                  className="bg-[#E34E62] hover:bg-[#cf4356] text-white text-xs font-semibold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
