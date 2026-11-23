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
  Layers,
  X,
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Facility Resource Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Laboratory Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Register new development hardware, monitor equipment health status, and schedule calibration or maintenance intervals.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Equipment</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading department equipment...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => (
            <Card key={eq.id} className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all flex flex-col justify-between">
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
                  <h3 className="font-bold text-[#172033] dark:text-[#F1F3FA] text-sm">{eq.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF] shrink-0" />
                    <span>{eq.laboratory_name}</span>
                  </div>
                  <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-2 line-clamp-2">{eq.description}</p>
                </div>

                <div className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A] flex justify-between">
                  <span>Serial: {eq.serial_number || "N/A"}</span>
                  <span className="font-semibold text-[#172033] dark:text-[#F1F3FA]">
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
                    className="w-full text-[11px] h-8 text-[#E99A27] dark:text-[#F4B544] bg-[#FEF5E9] dark:bg-[#382408] hover:bg-[#FDEED3] dark:hover:bg-[#482e0b] border-[#E99A27]/30"
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
        <div className="fixed inset-0 bg-[#080D19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white dark:bg-[#151D30] border-[#E2E8F0] dark:border-[#1F2C4A] shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#E99A27] dark:text-[#F4B544]" />
                  <span>Schedule Equipment Maintenance</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1">
                  Reserving a maintenance window marks {maintEquipment.name} as unavailable and prevents student bookings during this interval.
                </p>
              </div>
              <button
                onClick={() => setMaintEquipment(null)}
                className="text-[#68758B] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleMaintenance} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                    Start Window *
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={maintStart}
                    onChange={(e) => setMaintStart(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                    End Window *
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={maintEnd}
                    onChange={(e) => setMaintEnd(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                    Reason / Maintenance Description *
                  </label>
                  <Input
                    required
                    value={maintReason}
                    onChange={(e) => setMaintReason(e.target.value)}
                    placeholder="e.g. Firmware patch, calibration, or component replacement"
                    className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
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
                    className="bg-[#E99A27] hover:bg-[#d88a1b] text-white text-xs font-semibold"
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
        <div className="fixed inset-0 bg-[#080D19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white dark:bg-[#151D30] border-[#E2E8F0] dark:border-[#1F2C4A] shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#5945E8] dark:text-[#7968FF]" />
                  <span>Register New Laboratory Equipment</span>
                </CardTitle>
                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">
                  Expand your department's inventory with calibrated instrumentation.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#68758B] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEquipment} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Equipment Name *</label>
                  <Input
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Tektronix 4-Channel Oscilloscope"
                    className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Category *</label>
                    <Input
                      required
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value)}
                      className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Laboratory *</label>
                    <select
                      value={addLabId}
                      onChange={(e) => setAddLabId(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#1F2C4A] text-xs bg-[#F6F7FB] dark:bg-[#10182B] text-[#172033] dark:text-[#F1F3FA]"
                    >
                      {departments
                        .find((d) => d.id === user?.department_id)
                        ?.laboratories?.map((l) => (
                          <option key={l.id} value={l.id} className="bg-white dark:bg-[#151D30]">
                            {l.name} ({l.room_number})
                          </option>
                        )) || <option value="">No laboratory registered</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Model Number</label>
                    <Input
                      value={addModel}
                      onChange={(e) => setAddModel(e.target.value)}
                      placeholder="e.g. TBS1104B"
                      className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Serial Number</label>
                    <Input
                      value={addSerial}
                      onChange={(e) => setAddSerial(e.target.value)}
                      placeholder="e.g. SN-2026-99"
                      className="text-xs h-9 bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={addDesc}
                    onChange={(e) => setAddDesc(e.target.value)}
                    placeholder="Key specifications, capabilities, and safety notes..."
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1F2C4A] text-xs bg-[#F6F7FB] dark:bg-[#10182B] text-[#172033] dark:text-[#F1F3FA]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="restricted-toggle"
                    checked={addRestricted}
                    onChange={(e) => setAddRestricted(e.target.checked)}
                    className="h-4 w-4 rounded border-[#E2E8F0] dark:border-[#1F2C4A] text-[#5945E8] focus:ring-[#5945E8]"
                  />
                  <label htmlFor="restricted-toggle" className="text-xs text-[#172033] dark:text-[#F1F3FA] font-medium">
                    Mark as Restricted Gear (Requires Faculty Approval before confirmation)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1F2C4A]">
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
                    className="bg-[#5945E8] hover:bg-[#4D39D9] text-white text-xs font-semibold"
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
