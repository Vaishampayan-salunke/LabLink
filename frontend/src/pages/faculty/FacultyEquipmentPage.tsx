import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/services/api";
import { Equipment, Department, Laboratory } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Cpu,
  Plus,
  Wrench,
  Edit,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const FacultyEquipmentPage: React.FC = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Maintenance Dialog
  const [maintEquipment, setMaintEquipment] = useState<Equipment | null>(null);
  const [maintReason, setMaintReason] = useState("");
  const [maintStart, setMaintStart] = useState("");
  const [maintEnd, setMaintEnd] = useState("");
  const [maintNotes, setMaintNotes] = useState("");
  const [maintSubmitting, setMaintSubmitting] = useState(false);

  // Add Equipment Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("Embedded Systems");
  const [addModel, setAddModel] = useState("");
  const [addSerial, setAddSerial] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addRestricted, setAddRestricted] = useState(false);
  const [addLabId, setAddLabId] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const [eqs, depts] = await Promise.all([
        api.getEquipment({ department_id: user?.department_id || undefined }),
        api.getDepartments(),
      ]);
      setEquipmentList(eqs);
      setDepartments(depts);

      // Default lab id
      if (depts.length > 0 && depts[0].laboratories?.length > 0) {
        setAddLabId(depts[0].laboratories[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [user]);

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintEquipment) return;
    setMaintSubmitting(true);

    try {
      await api.scheduleMaintenance(maintEquipment.id, {
        start_time: new Date(maintStart).toISOString(),
        end_time: new Date(maintEnd).toISOString(),
        reason: maintReason,
        notes: maintNotes || undefined,
      });

      // Update equipment status locally
      await api.updateEquipment(maintEquipment.id, { status: "MAINTENANCE" });
      setMaintEquipment(null);
      await fetchEquipment();
    } catch (err: any) {
      alert(err.message || "Failed to schedule maintenance");
    } finally {
      setMaintSubmitting(false);
    }
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLabId || !user?.department_id) {
      alert("Department or Laboratory is not assigned");
      return;
    }
    setAddSubmitting(true);

    try {
      await api.createEquipment({
        name: addName,
        category: addCategory,
        department_id: user.department_id,
        laboratory_id: addLabId,
        model_number: addModel,
        serial_number: addSerial,
        description: addDesc,
        is_restricted: addRestricted,
        status: "AVAILABLE",
        total_quantity: 1,
        available_quantity: 1,
      });

      setShowAddModal(false);
      setAddName("");
      setAddDesc("");
      await fetchEquipment();
    } catch (err: any) {
      alert(err.message || "Failed to create equipment");
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Laboratory Resource Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register new development hardware, monitor equipment health, and schedule calibration or maintenance.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Equipment
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading department equipment...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => (
            <Card key={eq.id} className="border-slate-200/80 shadow-sm bg-white flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {eq.category}
                  </Badge>
                  <Badge
                    variant={eq.status === "AVAILABLE" ? "success" : "destructive"}
                    className="text-[10px]"
                  >
                    {eq.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{eq.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{eq.laboratory_name}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{eq.description}</p>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Serial: {eq.serial_number || "N/A"}</span>
                  <span className="font-semibold text-slate-800">
                    Units: {eq.available_quantity}/{eq.total_quantity}
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMaintEquipment(eq);
                      setMaintReason("");
                      const now = new Date();
                      setMaintStart(now.toISOString().slice(0, 16));
                      const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
                      setMaintEnd(tomorrow.toISOString().slice(0, 16));
                    }}
                    className="w-full text-[11px] h-8 text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1" />
                    Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Maintenance Dialog */}
      {maintEquipment && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white border-slate-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Schedule Equipment Maintenance</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Reserving a maintenance window marks {maintEquipment.name} as unavailable and prevents student bookings during this interval.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleMaintenance} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Window *
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={maintStart}
                    onChange={(e) => setMaintStart(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Window *
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={maintEnd}
                    onChange={(e) => setMaintEnd(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason / Maintenance Description *
                  </label>
                  <Input
                    required
                    value={maintReason}
                    onChange={(e) => setMaintReason(e.target.value)}
                    placeholder="e.g. Firmware patch, calibration, or component replacement"
                    className="text-xs h-9"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMaintEquipment(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={maintSubmitting}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                  >
                    {maintSubmitting ? "Scheduling..." : "Confirm Maintenance"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white border-slate-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Register New Laboratory Equipment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEquipment} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name *</label>
                  <Input
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Tektronix 4-Channel Oscilloscope"
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <Input
                      required
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory *</label>
                    <select
                      value={addLabId}
                      onChange={(e) => setAddLabId(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {departments
                        .find((d) => d.id === user?.department_id)
                        ?.laboratories?.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.room_number})
                          </option>
                        )) || <option value="">No laboratory registered</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number</label>
                    <Input
                      value={addModel}
                      onChange={(e) => setAddModel(e.target.value)}
                      placeholder="e.g. TBS1104B"
                      className="text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                    <Input
                      value={addSerial}
                      onChange={(e) => setAddSerial(e.target.value)}
                      placeholder="e.g. SN-2026-99"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={addDesc}
                    onChange={(e) => setAddDesc(e.target.value)}
                    placeholder="Key specifications, capabilities, and safety notes..."
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="restricted-toggle"
                    checked={addRestricted}
                    onChange={(e) => setAddRestricted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="restricted-toggle" className="text-xs text-slate-700 font-medium">
                    Mark as Restricted Gear (Requires Faculty Approval before confirmation)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addSubmitting}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    {addSubmitting ? "Registering..." : "Save Equipment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
