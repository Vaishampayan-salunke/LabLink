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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Departments & Laboratories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional academic departments, laboratory rooms, and facility operating parameters.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowDeptModal(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Department
          </Button>
          <Button
            onClick={() => setShowLabModal(true)}
            size="sm"
            variant="outline"
            className="text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Laboratory
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading department facilities...</div>
      ) : (
        <div className="space-y-6">
          {departments.map((d) => (
            <Card key={d.id} className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{d.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {d.code}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
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
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white border-slate-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Add Academic Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDept} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                  <Input
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Aeronautical Engineering"
                    className="text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                  <Input
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. AERO"
                    className="text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <Input
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
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
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white border-slate-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Add Laboratory Facility</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLab} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
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
