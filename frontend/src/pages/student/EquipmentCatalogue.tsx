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
  Cpu,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Layers,
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
    "Robotics",
    "Analytical Instruments",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Campus Cross-Department Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Explore Laboratory Equipment
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Discover specialized development kits, workstations, and high-precision instruments across all 5 engineering departments.
          </p>
        </div>

        <Button
          onClick={() => navigate("/student/assistant")}
          className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Match with AI Assistant</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#68758B] dark:text-[#A0ABC0]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by equipment name, model number, specifications (e.g. ESP32, FPGA, RTX 4090)..."
                className="pl-10 text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#10182B] text-xs text-[#172033] dark:text-[#F1F3FA] focus:outline-none focus:ring-2 focus:ring-[#5945E8]"
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
                className="h-10 px-3 rounded-[10px] border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#10182B] text-xs text-[#172033] dark:text-[#F1F3FA] focus:outline-none focus:ring-2 focus:ring-[#5945E8]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="secondary" size="sm" className="h-10 text-xs px-4">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#5945E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] font-medium">Fetching laboratory equipment records...</p>
        </div>
      ) : equipmentList.length === 0 ? (
        <Card className="py-20 text-center">
          <Cpu className="w-12 h-12 text-[#68758B]/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#172033] dark:text-[#F1F3FA]">No equipment matches criteria</h3>
          <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your department filter.
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
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => {
            const isAvailable = eq.status === "AVAILABLE" && eq.available_quantity > 0;
            return (
              <Card
                key={eq.id}
                className="hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 hover:shadow-card-hover transition-all overflow-hidden flex flex-col group"
              >
                {/* Equipment Photograph */}
                <div className="h-44 bg-[#080D19] relative overflow-hidden">
                  {eq.image_url ? (
                    <img
                      src={eq.image_url}
                      alt={eq.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#080D19] text-[#7968FF]">
                      <Cpu className="w-12 h-12 opacity-40" />
                    </div>
                  )}

                  {/* Top Status Overlays */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={isAvailable ? "success" : "destructive"}>
                      {isAvailable ? "Available" : eq.status}
                    </Badge>
                    {eq.is_restricted && (
                      <Badge variant="warning" className="text-[10px]">
                        Approval Required
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-[#5945E8] dark:text-[#A394FF] font-semibold">
                      <span>{eq.category}</span>
                      <span>•</span>
                      <span>{eq.department_name}</span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-[#172033] dark:text-[#F1F3FA] line-clamp-1 group-hover:text-[#5945E8] dark:group-hover:text-[#7968FF] transition-colors">
                      {eq.name}
                    </h3>

                    <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] line-clamp-2 leading-relaxed">
                      {eq.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1F2C4A] space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#68758B] dark:text-[#A0ABC0]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#68758B]" />
                        <span>{eq.laboratory_name || "Central Lab"}</span>
                      </span>
                      <span className="font-semibold text-[#172033] dark:text-[#F1F3FA] tabular-nums">
                        {eq.available_quantity}/{eq.total_quantity} Free
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/student/equipment/${eq.id}`)}
                      className="w-full text-xs font-semibold h-9 flex items-center justify-center gap-1.5"
                    >
                      <span>View Specifications & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
