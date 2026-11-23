import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Notification } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
} from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Activity Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Real-time updates regarding your laboratory reservations, faculty decisions, slot alerts, and maintenance events.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            size="sm"
            onClick={handleMarkAllAsRead}
            className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications Card */}
      <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Retrieving notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="w-12 h-12 text-[#68758B]/30 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">No notifications</h3>
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">You are all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    !n.is_read
                      ? "bg-[#5945E8]/5 dark:bg-[#5945E8]/10 hover:bg-[#5945E8]/10 dark:hover:bg-[#5945E8]/15"
                      : "hover:bg-[#F6F7FB] dark:hover:bg-[#10182B]/60"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-[#10182B] border border-[#E2E8F0] dark:border-[#1F2C4A] shrink-0">
                      {n.type === "BOOKING_APPROVED" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0DAA78] dark:text-[#21C997]" />
                      ) : n.type === "BOOKING_REJECTED" ? (
                        <XCircle className="w-4 h-4 text-[#E34E62] dark:text-[#F16B7B]" />
                      ) : (
                        <Bell className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            !n.is_read
                              ? "text-[#172033] dark:text-white"
                              : "text-[#68758B] dark:text-[#A0ABC0]"
                          }`}
                        >
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#5945E8] dark:bg-[#7968FF]"></span>
                        )}
                      </div>
                      <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[#68758B]/70 dark:text-[#A0ABC0]/70 mt-2 block font-medium">
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                  </div>

                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n.id);
                      }}
                      className="text-[10px] h-7 px-2.5 text-[#5945E8] dark:text-[#A394FF] hover:bg-[#5945E8]/10"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
