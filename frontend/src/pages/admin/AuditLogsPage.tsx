import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { History, Shield, Terminal } from "lucide-react";

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Compliance & Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Security & Transaction Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Immutable audit trail for institutional security compliance, authentication events, and equipment access records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold text-white border-white/20">
            {logs.length} Audit Entries
          </Badge>
        </div>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading audit records...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172033] dark:text-[#F1F3FA]">
                <thead className="bg-[#F6F7FB] dark:bg-[#10182B] border-b border-[#E2E8F0] dark:border-[#1F2C4A] text-[#68758B] dark:text-[#A0ABC0] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Entity Type</th>
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5">Source IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1F2C4A] font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F6F7FB] dark:hover:bg-[#1C2642]/50 transition-colors">
                      <td className="px-5 py-3.5 text-[#68758B] dark:text-[#A0ABC0] font-sans">{formatDate(log.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="font-bold text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#172033] dark:text-[#F1F3FA] font-medium font-sans">{log.entity_type}</td>
                      <td className="px-5 py-3.5 text-[#68758B] dark:text-[#A0ABC0] font-sans max-w-md">{log.details}</td>
                      <td className="px-5 py-3.5 text-[#68758B] dark:text-[#A0ABC0]">{log.ip_address || "127.0.0.1"}</td>
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
