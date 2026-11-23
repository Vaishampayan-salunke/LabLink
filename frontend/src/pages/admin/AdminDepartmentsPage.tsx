import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Department, Laboratory } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Building2, Plus, MapPin, Layers } from "lucide-react";

export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // New Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  // New Lab Modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [labName, setLabName] = useState("");
  const [labRoom, setLabRoom] = useState("");
  const [labBuilding, setLabBuilding] = useState("");
  const [labHours, setLabHours] = useState("08:00 - 18:00");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
      if (data.length > 0 && !selectedDeptId) {
        setSelectedDeptId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDepartment({
        name: deptName,
        code: deptCode,
        description: deptDesc,
      });
      setShowDeptModal(false);
      setDeptName("");
      setDeptCode("");
      await fetchDepartments();
    } catch (err: any) {
      alert(err.message || "Failed to create department");
    }
  };

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLaboratory({
        department_id: selectedDeptId,
        name: labName,
        room_number: labRoom,
        building: labBuilding,
        operating_hours: labHours,
      });
      setShowLabModal(false);
      setLabName("");
      setLabRoom("");
      setLabBuilding("");
      await fetchDepartments();
    } catch (err: any) {
      alert(err.message || "Failed to create laboratory");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Campus Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Departments & Laboratories
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Institutional academic departments, laboratory rooms, and facility operating parameters.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowDeptModal(true)}
            size="sm"
            className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Department
          </Button>
          <Button
            onClick={() => setShowLabModal(true)}
            size="sm"
            variant="outline"
            className="text-xs font-semibold border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Laboratory
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">Loading department facilities...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map((d) => (
            <Card key={d.id} className="border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#F6F7FB] dark:bg-[#10182B] border-b border-[#E2E8F0] dark:border-[#1F2C4A] py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#172033] dark:text-[#F1F3FA] text-sm">{d.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {d.code}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-0.5">{d.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {d.laboratories?.length || 0} Labs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {!d.laboratories || d.laboratories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No laboratories registered under this department.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {d.laboratories.map((lab) => (
                      <div
                        key={lab.id}
                        className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1 text-xs"
                      >
                        <span className="font-bold text-slate-800 block text-xs">{lab.name}</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            Room {lab.room_number}, {lab.building}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Hours: {lab.operating_hours}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">Add Academic Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDept} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Department Name *</label>
                  <Input
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Aeronautical Engineering"
                    className="text-xs h-9 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Code *</label>
                  <Input
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. AERO"
                    className="text-xs h-9 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Description</label>
                  <Input
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="text-xs h-9 bg-slate-50 dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold">
                    Create Department
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Lab Modal */}
      {showLabModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#172033] dark:text-[#F1F3FA]">Add Laboratory Facility</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLab} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">Department *</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] text-xs bg-slate-50 dark:bg-[#10182B] text-[#172033] dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-white dark:bg-[#151D30]">
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lab Name *</label>
                  <Input
                    required
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="e.g. Aerodynamics & Wind Tunnel Lab"
                    className="text-xs h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number *</label>
                    <Input
                      required
                      value={labRoom}
                      onChange={(e) => setLabRoom(e.target.value)}
                      placeholder="AE-102"
                      className="text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Building *</label>
                    <Input
                      required
                      value={labBuilding}
                      onChange={(e) => setLabBuilding(e.target.value)}
                      placeholder="Kalam Wing"
                      className="text-xs h-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <Input
                    value={labHours}
                    onChange={(e) => setLabHours(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowLabModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    Create Lab
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
