import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Security & Transaction Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit trail for institutional security compliance, login events, and access actions.
        </p>
      </div>

      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading audit records...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Entity Type</th>
                    <th className="px-5 py-3">Details</th>
                    <th className="px-5 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 text-slate-500">{formatDate(log.created_at)}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="font-bold text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-medium">{log.entity_type}</td>
                      <td className="px-5 py-3 text-slate-600 font-sans max-w-md">{log.details}</td>
                      <td className="px-5 py-3 text-slate-400">{log.ip_address || "127.0.0.1"}</td>
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
