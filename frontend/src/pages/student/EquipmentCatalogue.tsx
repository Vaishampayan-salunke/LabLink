import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Equipment, Department } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Filter,
  Cpu,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export const EquipmentCatalogue: React.FC = () => {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const depts = await api.getDepartments();
        setDepartments(depts);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMeta();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await api.getEquipment({
        search: search || undefined,
        department_id: selectedDept || undefined,
        category: selectedCategory || undefined,
      });
      setEquipmentList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [selectedDept, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEquipment();
  };

  const categories = [
    "All Categories",
    "Embedded Systems",
    "Single Board Computers",
    "High Performance Computing",
    "FPGA & Reconfigurable Logic",
    "Measurement & Testing",
    "Additive Manufacturing",
    "Industrial Automation",
    "Sensor Arrays",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Laboratory Equipment Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time availability of campus development boards, oscilloscopes, GPU clusters, and tools.
          </p>
        </div>

        <Button
          onClick={() => navigate("/student/assistant")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold self-start md:self-auto text-xs"
        >
          Match with AI Project Assistant
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by equipment name, specification, model number (e.g. ESP32, RTX 4090)..."
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value === "All Categories" ? "" : e.target.value)
                }
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="secondary" size="sm" className="h-10 text-xs px-4">
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Fetching laboratory equipment records...</p>
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No equipment found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting your department filter.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedDept("");
              setSelectedCategory("");
              loadEquipment();
            }}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => {
            const isAvailable = eq.status === "AVAILABLE" && eq.available_quantity > 0;
            return (
              <Card
                key={eq.id}
                className="border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group bg-white"
              >
                {/* Equipment Image or fallback */}
                <div className="h-44 bg-slate-900 relative overflow-hidden">
                  {eq.image_url ? (
                    <img
                      src={eq.image_url}
                      alt={eq.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-indigo-400">
                      <Cpu className="w-12 h-12 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <Badge variant="outline" className="bg-slate-900/80 text-white border-slate-700 backdrop-blur-md text-[10px]">
                      {eq.category}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={isAvailable ? "success" : "destructive"}
                      className="backdrop-blur-md text-[10px] font-bold"
                    >
                      {eq.status}
                    </Badge>
                  </div>

                  {eq.is_restricted && (
                    <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Restricted Gear (Faculty Approval Required)</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {eq.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {eq.department_name} • {eq.laboratory_name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {eq.description}
                    </p>

                    {/* Specs Pills */}
                    {eq.specifications && eq.specifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {eq.specifications.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            <span className="font-semibold text-slate-900 mr-1">{s.spec_name}:</span> {s.spec_value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Units: <span className="font-bold text-slate-900">{eq.available_quantity}/{eq.total_quantity}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/student/equipment/${eq.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8"
                    >
                      <span>Check & Reserve</span>
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
