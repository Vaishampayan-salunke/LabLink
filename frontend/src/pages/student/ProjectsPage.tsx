import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderOpen, Users, Calendar, Clock, AlertCircle, X, Sparkles } from "lucide-react";
import { apiClient } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  members: { id: string; user_id: string; role: string; joined_at: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "warning",
  ACTIVE: "success",
  COMPLETED: "primary",
  ARCHIVED: "default",
};

export function ProjectsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", domain: "IoT & Embedded Systems" });
  const [error, setError] = useState("");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("/projects").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; domain: string }) =>
      apiClient.post("/projects", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setForm({ title: "", description: "", domain: "IoT & Embedded Systems" });
      setError("");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || "Failed to create project.");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Academic Research Workspaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            My Research Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Track multi-week hardware allocation, team members, and milestones for your academic capstone and laboratory studies.
          </p>
        </div>

        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-xs shadow-md shadow-[#5945E8]/20 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-[#080D19]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151D30] border border-[#E2E8F0] dark:border-[#1F2C4A] rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-[#172033] dark:text-[#F1F3FA]">Create New Project</h2>
              <button
                onClick={() => { setShowCreate(false); setError(""); }}
                className="text-[#68758B] hover:text-[#172033] dark:hover:text-[#F1F3FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                  Project Title *
                </label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Smart Irrigation Network"
                  className="bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA] text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                  Domain / Technology Area *
                </label>
                <Input
                  value={form.domain}
                  onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                  placeholder="e.g. IoT & Embedded Systems"
                  className="bg-[#F6F7FB] dark:bg-[#10182B] border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA] text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] dark:text-[#F1F3FA] mb-1">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your project, goals, and equipment needs..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] dark:border-[#1F2C4A] rounded-xl bg-[#F6F7FB] dark:bg-[#10182B] text-[#172033] dark:text-[#F1F3FA] placeholder-[#68758B] focus:outline-none focus:ring-2 focus:ring-[#7968FF] text-xs"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-[#E34E62] dark:text-[#F16B7B] text-xs bg-[#E34E62]/10 p-2.5 rounded-lg border border-[#E34E62]/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCreate(false); setError(""); }}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-[#5945E8] hover:bg-[#4D39D9] text-white text-xs font-semibold"
                >
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-[#68758B]/40 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#172033] dark:text-[#F1F3FA]">No projects yet</h3>
          <p className="text-[#68758B] dark:text-[#A0ABC0] mt-1 mb-6 text-xs max-w-sm mx-auto">
            Create a project workspace to organise your equipment bookings and collaborate with peers.
          </p>
          <Button onClick={() => setShowCreate(true)} className="bg-[#5945E8] text-white text-xs">
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <Card key={project.id} className="p-5 hover:border-[#5945E8]/40 dark:hover:border-[#7968FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-sm text-[#172033] dark:text-[#F1F3FA] truncate">
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-[#5945E8] dark:text-[#A394FF] font-medium mt-0.5">{project.domain}</p>
                  </div>
                  <Badge variant={STATUS_COLORS[project.status] as any} className="ml-2 shrink-0 text-[10px]">
                    {project.status}
                  </Badge>
                </div>

                <p className="text-xs text-[#68758B] dark:text-[#A0ABC0] line-clamp-3 mb-4">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#68758B] dark:text-[#A0ABC0] border-t border-[#E2E8F0] dark:border-[#1F2C4A] pt-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#5945E8] dark:text-[#7968FF]" />
                  <span>{project.members?.length || 1} researcher(s)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
