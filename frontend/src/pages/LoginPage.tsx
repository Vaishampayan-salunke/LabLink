import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Cpu,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  UserCheck,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("failed to fetch") || err.name === "TypeError") {
        setError("Cannot reach backend server. If using Render free tier, the backend may take ~30 seconds to wake up from sleep. Please wait a moment and try again.");
      } else {
        setError(msg || "Invalid institutional credentials. Please check your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("failed to fetch") || err.name === "TypeError") {
        setError("Cannot reach backend server. If using Render free tier, the backend may take ~30 seconds to wake up from sleep. Please wait a moment and try again.");
      } else {
        setError(msg || "Demo authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080D19] flex items-stretch overflow-hidden font-sans">
      {/* LEFT COLUMN: Hero & Platform Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 bg-[#0B1020] border-r border-[#1B253D] overflow-hidden">
        {/* Subtle radial ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#5945E8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#7968FF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5945E8] to-[#8170F5] flex items-center justify-center text-white shadow-lg shadow-[#5945E8]/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-heading font-extrabold text-white tracking-tight">LabLink</span>
            <span className="block text-[10px] font-semibold tracking-wider text-[#A394FF] uppercase">
              Campus Laboratory Platform
            </span>
          </div>
        </div>

        {/* Center Presentation Visual */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151D30] border border-[#233152] text-[#A394FF] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>GenAI-Powered Laboratory Resource Allocation</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Making college laboratories <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7968FF] via-[#A394FF] to-white">
              accessible, transparent & fair.
            </span>
          </h2>

          <p className="mt-4 text-sm xl:text-base text-[#A0ABC0] max-w-lg leading-relaxed">
            A unified institutional management platform connecting students, faculty coordinators, and administrators with specialized engineering and scientific equipment across all campus departments.
          </p>

          {/* Feature Highlights Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
            <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#202B45] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-[#5945E8]/20 text-[#A394FF] flex items-center justify-center mb-2.5">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Dept Inventory</h4>
              <p className="text-[11px] text-[#A0ABC0] mt-1">28+ calibrated instruments across 5 engineering departments.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#202B45] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-[#0DAA78]/20 text-[#21C997] flex items-center justify-center mb-2.5">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Conflict-Free Slots</h4>
              <p className="text-[11px] text-[#A0ABC0] mt-1">Deterministic multi-objective scheduling with automated alternatives.</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#68758B] border-t border-[#1B253D] pt-6">
          <span>Enterprise Campus LIMS Edition</span>
          <span>© 2026 LabLink Platform</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication & Demo Persona Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5945E8] to-[#8170F5] flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-heading font-extrabold text-white">LabLink</span>
              <span className="block text-[10px] font-semibold text-[#A394FF] uppercase">Campus Lab Platform</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Sign In to LabLink
            </h1>
            <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1.5">
              Enter your institutional credentials or select a verified demo persona below.
            </p>
          </div>

          {/* Quick Demo Personas - Required by Prompt */}
          <div className="p-4 rounded-xl bg-[#10182B] border border-[#202B45] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#A394FF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] text-[#68758B]">Click to test role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSignIn("student.alex@lablink.demo", "LabLink@Student2026")}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-[#151D30] hover:bg-[#1E2943] border border-[#243252] text-left transition-all group hover:border-[#7968FF]/50"
              >
                <div className="flex items-center justify-between text-[#21C997] font-semibold text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-white font-medium truncate">Alex Rivera</p>
                <p className="text-[9px] text-[#A0ABC0] truncate">STU-2026-081</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSignIn("faculty.ece@lablink.demo", "LabLink@Faculty2026")}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-[#151D30] hover:bg-[#1E2943] border border-[#243252] text-left transition-all group hover:border-[#7968FF]/50"
              >
                <div className="flex items-center justify-between text-[#A394FF] font-semibold text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-white font-medium truncate">Prof. Rostova</p>
                <p className="text-[9px] text-[#A0ABC0] truncate">ECE Coordinator</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSignIn("admin@lablink.demo", "LabLink@Demo2026")}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-[#151D30] hover:bg-[#1E2943] border border-[#243252] text-left transition-all group hover:border-[#7968FF]/50"
              >
                <div className="flex items-center justify-between text-[#F16B7B] font-semibold text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-white font-medium truncate">Dr. Vance</p>
                <p className="text-[9px] text-[#A0ABC0] truncate">Dean of Labs</p>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#E34E62]/10 border border-[#E34E62]/20 text-[#F16B7B] text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F3FA] mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                <Input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu or demo email"
                  style={{ colorScheme: "dark" }}
                  className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#F1F3FA]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#7968FF] hover:text-[#A394FF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ colorScheme: "dark" }}
                  className="pl-9 pr-10 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#68758B] hover:text-[#F1F3FA]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#A0ABC0]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1F2C4A] bg-[#10182B] text-[#5945E8] focus:ring-[#5945E8]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold text-sm shadow-md shadow-[#5945E8]/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-[#A0ABC0] pt-2">
            New student researcher?{" "}
            <Link to="/register" className="font-semibold text-[#7968FF] hover:text-[#A394FF] hover:underline">
              Create student profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
